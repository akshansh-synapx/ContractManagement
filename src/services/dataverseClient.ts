// ============================================================================
// Dataverse Client — Uses WithOrganization operations
// ============================================================================
// The org URL is discovered dynamically at runtime via GetOrganizations,
// so the same build works in Dev, UAT, and PROD without code changes.
// The connection reference in the solution determines which Dataverse
// environment is targeted — when imported into a new env, it just works.
// ============================================================================
// NOTE: This file only works inside Power Apps runtime. During local dev
// (npm run dev) all imports from @microsoft/power-apps/* will fail, so
// the dataService.ts detects the environment and falls back to localStorage.
// ============================================================================

import type { IOperationResult } from "@microsoft/power-apps/data";
import { getClient } from "@microsoft/power-apps/data";
import { dataSourcesInfo } from "../../.power/schemas/appschemas/dataSourcesInfo";

export interface EntityItemList {
  value?: EntityItem[];
  "@odata.nextLink"?: string;
}

export interface EntityItem {
  dynamicProperties?: Record<string, unknown>;
}

const DS = "commondataserviceforapps";
const client = getClient(dataSourcesInfo);

// -- Dynamic org URL resolution ----------------------------------------------
let _resolvedOrg: string | null = null;
let _orgPromise: Promise<string> | null = null;

/**
 * Discover the Dataverse org URL via the connector's GetOrganizations call.
 * Caches after the first successful call so subsequent requests are instant.
 */
async function getOrgUrl(): Promise<string> {
  if (_resolvedOrg) return _resolvedOrg;

  if (!_orgPromise) {
    _orgPromise = (async () => {
      try {
        const res = await client.executeAsync<
          Record<string, unknown>,
          Record<string, unknown>
        >({
          connectorOperation: {
            tableName: DS,
            operationName: "GetOrganizations",
            parameters: {},
          },
        });

        if (res.success && res.data) {
          const data = res.data as Record<string, unknown>;
          const orgs = (data.value ?? data) as Record<string, unknown>[] | Record<string, unknown>;

          let url: string | undefined;
          if (Array.isArray(orgs) && orgs.length > 0) {
            const first = orgs[0];
            url =
              (first.OrganizationUrl as string) ??
              (first.Url as string) ??
              (first.organizationUrl as string) ??
              (first.url as string);
          }

          if (url) {
            _resolvedOrg = url.replace(/\/+$/, "");
            return _resolvedOrg;
          }
        }
      } catch (err) {
        throw new Error(
          `Failed to discover Dataverse organization URL. ` +
          `Ensure the Dataverse connection reference is configured correctly in this environment. ` +
          `(${err instanceof Error ? err.message : String(err)})`
        );
      }

      throw new Error(
        "Failed to discover Dataverse organization URL: GetOrganizations returned no valid URL. " +
        "Ensure the Dataverse connection reference is configured correctly in this environment."
      );
    })();
  }

  return _orgPromise;
}

// Pre-warm: start org URL discovery immediately at module load time.
getOrgUrl().catch(() => { /* handled when awaited */ });

/** Throw if the connector operation failed. */
function throwOnFail<T>(res: IOperationResult<T>, op: string): void {
  if (!res.success) {
    const msg =
      res.error instanceof Error
        ? res.error.message
        : String(res.error ?? "Unknown error");
    throw new Error(`Dataverse ${op}: ${msg}`);
  }
}

// ---- ListRecords (WithOrganization) ----------------------------------------
export async function ListRecords(
  entityName: string,
  prefer?: string,
  accept?: string,
  x_ms_odata_metadata_full?: boolean,
  $select?: string,
  $filter?: string,
  $orderby?: string,
  $expand?: string,
  fetchXml?: string,
  $top?: number,
): Promise<IOperationResult<EntityItemList>> {
  const org = await getOrgUrl();
  const res = await client.executeAsync<
    Record<string, unknown>,
    EntityItemList
  >({
    connectorOperation: {
      tableName: DS,
      operationName: "ListRecordsWithOrganization",
      parameters: {
        organization: org,
        entityName,
        prefer,
        accept,
        "x-ms-odata-metadata-full": x_ms_odata_metadata_full,
        $select,
        $filter,
        $orderby,
        $expand,
        fetchXml,
        $top,
      },
    },
  });
  throwOnFail(res, `ListRecords(${entityName})`);
  return res;
}

// ---- GetItem (WithOrganization) --------------------------------------------
export async function GetItem(
  prefer: string,
  accept: string,
  entityName: string,
  recordId: string,
  x_ms_odata_metadata_full?: boolean,
  $select?: string,
  $expand?: string,
): Promise<IOperationResult<Record<string, unknown>>> {
  const org = await getOrgUrl();
  const res = await client.executeAsync<
    Record<string, unknown>,
    Record<string, unknown>
  >({
    connectorOperation: {
      tableName: DS,
      operationName: "GetItemWithOrganization",
      parameters: {
        organization: org,
        entityName,
        recordId,
        prefer,
        accept,
        "x-ms-odata-metadata-full": x_ms_odata_metadata_full,
        $select,
        $expand,
      },
    },
  });
  throwOnFail(res, `GetItem(${entityName}, ${recordId})`);
  return res;
}

// ---- UpdateRecord (WithOrganization) — upsert via PATCH --------------------
export async function UpdateRecord(
  prefer: string,
  accept: string,
  entityName: string,
  recordId: string,
  item: Record<string, unknown>,
): Promise<IOperationResult<Record<string, unknown>>> {
  const org = await getOrgUrl();
  const res = await client.executeAsync<
    Record<string, unknown>,
    Record<string, unknown>
  >({
    connectorOperation: {
      tableName: DS,
      operationName: "UpdateRecordWithOrganization",
      parameters: {
        organization: org,
        entityName,
        recordId,
        item,
        prefer,
        accept,
      },
    },
  });
  throwOnFail(res, `UpdateRecord(${entityName}, ${recordId})`);
  return res;
}

// ---- CreateRecord (WithOrganization) ---------------------------------------
export async function CreateRecord(
  prefer: string,
  accept: string,
  entityName: string,
  item: Record<string, unknown>,
): Promise<IOperationResult<void>> {
  const org = await getOrgUrl();
  const res = await client.executeAsync<Record<string, unknown>, void>({
    connectorOperation: {
      tableName: DS,
      operationName: "CreateRecordWithOrganization",
      parameters: {
        organization: org,
        entityName,
        item,
        prefer,
        accept,
      },
    },
  });
  throwOnFail(res, `CreateRecord(${entityName})`);
  return res;
}

// ---- DeleteRecord (WithOrganization) ---------------------------------------
export async function DeleteRecord(
  entityName: string,
  recordId: string,
): Promise<IOperationResult<void>> {
  const org = await getOrgUrl();
  const res = await client.executeAsync<Record<string, unknown>, void>({
    connectorOperation: {
      tableName: DS,
      operationName: "DeleteRecordWithOrganization",
      parameters: {
        organization: org,
        entityName,
        recordId,
      },
    },
  });
  throwOnFail(res, `DeleteRecord(${entityName}, ${recordId})`);
  return res;
}
