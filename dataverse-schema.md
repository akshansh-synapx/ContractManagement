# ============================================================================
# Synapx Contract Management — Dataverse Schema Definition
# ============================================================================
# Publisher prefix: syn_
# Solution: SynapxContractManagement
#
# This file documents the exact tables, columns, option-sets, and
# relationships needed in the Dataverse dev environment.
# Use this as a reference when creating tables via make.powerapps.com
# or via PAC CLI / solution import.
# ============================================================================


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  TABLE 1:  syn_docrequest  (Document Requests)                         ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# Display Name:    Document Request
# Plural Name:     Document Requests
# Logical Name:    syn_docrequest
# Primary Column:  syn_title (Single Line of Text, 200 chars)
# Ownership:       User or Team
#
# ── Columns ──────────────────────────────────────────────────────────────
#
# Column Logical Name          | Type              | Required | Details
# ─────────────────────────────|───────────────────|──────────|──────────────────────
# syn_docrequestid             | Uniqueidentifier  | Auto     | Primary key (auto-generated)
# syn_title                    | Text (200)        | Yes      | Primary name column
# syn_description              | Multiline Text    | No       | Rich description of the request
# syn_requesttype              | Choice            | Yes      | See Option Set: syn_requesttype
# syn_requeststatus            | Choice            | Yes      | See Option Set: syn_requeststatus
# syn_priority                 | Choice            | Yes      | See Option Set: syn_priority
# syn_requestedby              | Text (200)        | Yes      | Name of the person who raised the request
# syn_assignedto               | Text (200)        | No       | Person or team assigned
# syn_closedat                 | Date and Time     | No       | When the request was closed
# syn_finalversionid           | Text (100)        | No       | GUID of the final signed-off version
# statecode                    | State             | Auto     | Active / Inactive (system)
# statuscode                   | Status            | Auto     | Active / Inactive (system)
# createdon                    | Date and Time     | Auto     | System audit field
# modifiedon                   | Date and Time     | Auto     | System audit field
#
# ── Option Sets ──────────────────────────────────────────────────────────
#
# syn_requesttype (Global Choice)
#   Value | Label
#   ──────|──────────
#   0     | Legal
#   1     | Contract
#
# syn_requeststatus (Global Choice)
#   Value | Label
#   ──────|──────────────
#   0     | Open
#   1     | In Discussion
#   2     | In Review
#   3     | Closed
#
# syn_priority (Global Choice)
#   Value | Label
#   ──────|────────
#   0     | Low
#   1     | Medium
#   2     | High
#


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  TABLE 2:  syn_discussion  (Discussion Messages)                       ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# Display Name:    Discussion
# Plural Name:     Discussions
# Logical Name:    syn_discussion
# Primary Column:  syn_name (auto-number or summary, 200 chars)
# Ownership:       User or Team
#
# ── Columns ──────────────────────────────────────────────────────────────
#
# Column Logical Name          | Type              | Required | Details
# ─────────────────────────────|───────────────────|──────────|──────────────────────
# syn_discussionid             | Uniqueidentifier  | Auto     | Primary key
# syn_name                     | Text (200)        | Yes      | Primary name (auto-number or summary)
# syn_docrequestid             | Lookup            | Yes      | FK → syn_docrequest (N:1)
# syn_docversionid             | Lookup            | No       | FK → syn_docversion (N:1), null = general discussion
# syn_userid                   | Text (100)        | Yes      | ID of the user who posted
# syn_username                 | Text (200)        | Yes      | Display name of the user
# syn_message                  | Multiline Text    | Yes      | The discussion message body
# syn_timestamp                | Date and Time     | Yes      | When the message was posted
# statecode                    | State             | Auto     | System
# statuscode                   | Status            | Auto     | System
# createdon                    | Date and Time     | Auto     | System
# modifiedon                   | Date and Time     | Auto     | System
#
# ── Relationships ────────────────────────────────────────────────────────
#
# syn_docrequest_discussions  (1:N)
#   Parent: syn_docrequest.syn_docrequestid
#   Child:  syn_discussion.syn_docrequestid
#   Cascade: Delete → RemoveLink (discussions kept as audit trail)
#
# syn_docversion_discussions  (1:N)
#   Parent: syn_docversion.syn_docversionid
#   Child:  syn_discussion.syn_docversionid
#   Cascade: Delete → RemoveLink
#


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  TABLE 3:  syn_docversion  (Document Versions)                         ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# Display Name:    Document Version
# Plural Name:     Document Versions
# Logical Name:    syn_docversion
# Primary Column:  syn_title (Single Line of Text, 200 chars)
# Ownership:       User or Team
#
# ── Columns ──────────────────────────────────────────────────────────────
#
# Column Logical Name          | Type              | Required | Details
# ─────────────────────────────|───────────────────|──────────|──────────────────────
# syn_docversionid             | Uniqueidentifier  | Auto     | Primary key
# syn_title                    | Text (200)        | Yes      | Primary name — version title
# syn_docrequestid             | Lookup            | Yes      | FK → syn_docrequest (N:1)
# syn_versionnumber            | Whole Number      | Yes      | Sequential version (1, 2, 3…)
# syn_documenturl              | URL (2000)        | Yes      | Link to the document (Google Docs, SharePoint, etc.)
# syn_description              | Multiline Text    | No       | What changed in this version
# syn_uploadedby               | Text (200)        | Yes      | Name of the uploader
# syn_uploadedat               | Date and Time     | Yes      | When the version was uploaded
# syn_signedoff                | Two Option        | Yes      | Yes/No — has this version been signed off
# syn_signedoffby              | Text (200)        | No       | Name of the person who signed off
# syn_signedoffat              | Date and Time     | No       | When the sign-off happened
# statecode                    | State             | Auto     | System
# statuscode                   | Status            | Auto     | System
# createdon                    | Date and Time     | Auto     | System
# modifiedon                   | Date and Time     | Auto     | System
#
# ── Relationships ────────────────────────────────────────────────────────
#
# syn_docrequest_versions  (1:N)
#   Parent: syn_docrequest.syn_docrequestid
#   Child:  syn_docversion.syn_docrequestid
#   Cascade: Delete → Cascade (versions deleted with request)
#


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  ENTITY RELATIONSHIP DIAGRAM (ERD)                                     ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
#   ┌─────────────────────────┐
#   │     syn_docrequest      │
#   │─────────────────────────│
#   │ PK syn_docrequestid     │
#   │    syn_title            │
#   │    syn_description      │
#   │    syn_requesttype      │ ← Choice (Legal / Contract)
#   │    syn_requeststatus    │ ← Choice (Open / In Discussion / In Review / Closed)
#   │    syn_priority         │ ← Choice (Low / Medium / High)
#   │    syn_requestedby      │
#   │    syn_assignedto       │
#   │    syn_closedat         │
#   │    syn_finalversionid   │ ── (text ref to final version GUID)
#   └────────┬────────┬───────┘
#            │        │
#        1:N │        │ 1:N
#            │        │
#   ┌────────▼──────┐ │  ┌──────────────────────────┐
#   │ syn_discussion │ │  │     syn_docversion        │
#   │────────────────│ │  │──────────────────────────│
#   │ PK syn_discussionid│ │  │ PK syn_docversionid      │
#   │ FK syn_docrequestid│ │  │ FK syn_docrequestid      │
#   │ FK syn_docversionid│─┘  │    syn_title              │
#   │    syn_userid      │    │    syn_versionnumber      │
#   │    syn_username     │    │    syn_documenturl        │
#   │    syn_message      │    │    syn_description        │
#   │    syn_timestamp    │    │    syn_uploadedby         │
#   └────────────────────┘    │    syn_uploadedat         │
#            ▲                │    syn_signedoff          │
#            │ N:1 (optional) │    syn_signedoffby        │
#            └────────────────│    syn_signedoffat        │
#              syn_docversionid    └──────────────────────────┘
#


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  PAC CLI — Quick-Create Commands                                       ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# After creating the tables in make.powerapps.com, generate typed models:
#
#   pac code add-data-source -a dataverse -t syn_docrequest
#   pac code add-data-source -a dataverse -t syn_discussion
#   pac code add-data-source -a dataverse -t syn_docversion
#
# These commands generate the models/ and services/ under src/generated/
# matching the pattern used in the Synapx Effort Estimator.
#


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  SEED DATA — Initial records for testing                               ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# After deploying tables to Dev, import these records to verify the app:
#
# syn_docrequest seed (4 records):
#   1. "Vendor Supply Agreement - TechCorp"  | Contract | In Discussion | High
#   2. "NDA - CloudSync Partnership"         | Legal    | In Review     | Medium
#   3. "Employee Contract Template Update"   | Contract | Open          | Low
#   4. "Data Processing Agreement - GDPR"    | Legal    | Closed        | High
#
# syn_docversion seed (4 records):
#   v1 for req-1, v1 for req-2, v2 for req-2, v1 for req-4 (final)
#
# syn_discussion seed (5 records):
#   3 messages on req-1, 2 messages on req-2
#
