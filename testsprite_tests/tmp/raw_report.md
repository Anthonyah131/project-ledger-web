
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** project-ledger-web
- **Date:** 2026-03-28
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC003 Login successfully redirects to dashboard after spinner clears
- **Test Code:** [TC003_Login_successfully_redirects_to_dashboard_after_spinner_clears.py](./TC003_Login_successfully_redirects_to_dashboard_after_spinner_clears.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/4242094b-5be0-4a13-964b-81f067d4d22d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Login with wrong credentials shows error toast
- **Test Code:** [TC004_Login_with_wrong_credentials_shows_error_toast.py](./TC004_Login_with_wrong_credentials_shows_error_toast.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/3deaaf05-b162-41e2-8da4-7bd8b5906824
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Login required-field validation when submitting empty form
- **Test Code:** [TC005_Login_required_field_validation_when_submitting_empty_form.py](./TC005_Login_required_field_validation_when_submitting_empty_form.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/71c08dc4-e53b-420e-be7f-9ed0a375e429
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Dashboard: View monthly overview and interact with controls
- **Test Code:** [TC008_Dashboard_View_monthly_overview_and_interact_with_controls.py](./TC008_Dashboard_View_monthly_overview_and_interact_with_controls.py)
- **Test Error:** Month navigation did not update the displayed month after interaction.

Observations:
- The dashboard loaded successfully and shows monthly summary cards (Monthly expenses, Monthly income, Net balance).
- The project selector is present and displays "E2E Test Project" (project scoping UI is available).
- The Previous month button was present and a click action was attempted, but the month label still shows "March 2026" (no visible change).
- Charts/sections show empty-state messages (No movements in payment methods, No categories with spending), which is consistent with an empty dataset.
- Project selector and month controls are interactive elements on the page, but month navigation behavior could not be confirmed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/e1ec6aeb-19fe-42bc-9b4c-7b0c4639b830
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Project Management: Create a new project
- **Test Code:** [TC012_Project_Management_Create_a_new_project.py](./TC012_Project_Management_Create_a_new_project.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/48c7edb9-8fe3-40bc-bdc4-2cd73196b2e2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Project Management: Edit an existing project
- **Test Code:** [TC013_Project_Management_Edit_an_existing_project.py](./TC013_Project_Management_Edit_an_existing_project.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/d5b842f0-8d5d-444f-8582-357a22b83610
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Project Management: Delete a project and verify it is removed from list
- **Test Code:** [TC015_Project_Management_Delete_a_project_and_verify_it_is_removed_from_list.py](./TC015_Project_Management_Delete_a_project_and_verify_it_is_removed_from_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/377c9e1a-31ef-49f0-b9a3-f551623b534f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Create a new project expense from a project detail page
- **Test Code:** [TC016_Create_a_new_project_expense_from_a_project_detail_page.py](./TC016_Create_a_new_project_expense_from_a_project_detail_page.py)
- **Test Error:** Expense creation could not be completed because no payment methods are available to select.

Observations:
- The New expense modal is open and the form was filled with: Title='Expense seed 001', Amount='123.45', Date='2026-03-28'.
- The Payment method control shows only the placeholder 'Select' and the payment-method listbox contains no options.
- A validation message 'Payment method is required' is displayed and blocks submission.
- The expenses list behind the modal shows 'No expenses recorded' and 'Expense seed 001' is not present.
- Create expense was attempted twice but both attempts were blocked by the missing payment method.

Extracted details:
- New expense modal visible text includes: New expense; Title *; Amount *; Expense date *; Category *General; Payment method *Select; Create expense; Cancel; Close.
- Open payment-method listbox — option texts present: none (only placeholder 'Select').
- Expenses list behind the modal — existing expense titles: none (page shows 'No expenses recorded').
- Modal validation messages: 'Payment method is required'.

Because there are no payment-method options to choose, it is not possible to complete an end-to-end creation of the expense at this time. Please add at least one payment method (e.g., via the Payment methods page) and rerun the expense creation step if the test should continue.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/83d3a140-7373-4a4d-9f3a-b7ef8dd46fa9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Validate missing amount on new expense submission
- **Test Code:** [TC018_Validate_missing_amount_on_new_expense_submission.py](./TC018_Validate_missing_amount_on_new_expense_submission.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/72a8092c-e6c8-4857-a30f-66919ecb2717
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Create a new project income from a project detail page
- **Test Code:** [TC022_Create_a_new_project_income_from_a_project_detail_page.py](./TC022_Create_a_new_project_income_from_a_project_detail_page.py)
- **Test Error:** Income creation could not be completed because no Destination account / payment method options are available in the New income modal. The form is filled (Title: 'Income seed 001', Amount: 500.00, Date: 2026-03-28) but client-side validation prevents saving without a destination account.

Observations:
- The New income modal is open and the fields Title, Amount, and Income date are filled.
- The Destination account field shows 'Select' and opening its listbox shows no selectable options.
- A payment method 'Card E2E' was created earlier (success toast observed), but it does not appear in the Destination account list.
- Attempting to create the income is blocked by validation: 'Payment method is required.'
- Because the required Destination account options are missing, the income cannot be created or verified in the incomes list.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/ff8eedcb-050d-4244-8f14-334c1db22c64
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Validate missing required fields on new income submission
- **Test Code:** [TC024_Validate_missing_required_fields_on_new_income_submission.py](./TC024_Validate_missing_required_fields_on_new_income_submission.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/efb60b15-88d2-4ec9-8ec0-03a2a0576ba8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Create a new category with optional color
- **Test Code:** [TC027_Create_a_new_category_with_optional_color.py](./TC027_Create_a_new_category_with_optional_color.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/69fdc4e3-db49-4cd7-8342-0439f7a676e0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC031 Project Budget tab loads and shows budget utilization UI
- **Test Code:** [TC031_Project_Budget_tab_loads_and_shows_budget_utilization_UI.py](./TC031_Project_Budget_tab_loads_and_shows_budget_utilization_UI.py)
- **Test Error:** Budget utilization and category-level progress indicators could not be verified because no budget is configured for the project.

Observations:
- The 'E2E Test Project' Budget tab was opened successfully.
- The Budget view displays an empty state message: 'No budget configured'.
- A 'Configure budget' button is present on the page.
- No budget utilization summary or category-level progress bars/indicators are visible.
- Project tabs and other UI elements are rendered normally.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/e6598115-c813-49cd-8a11-20ec14dac01c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC032 Set and save a project-level budget amount
- **Test Code:** [TC032_Set_and_save_a_project_level_budget_amount.py](./TC032_Set_and_save_a_project_level_budget_amount.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/c4868faa-5676-43f9-8d9e-b00a16a51f62
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC035 Project Obligations tab loads and shows obligations list area
- **Test Code:** [TC035_Project_Obligations_tab_loads_and_shows_obligations_list_area.py](./TC035_Project_Obligations_tab_loads_and_shows_obligations_list_area.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/33556e62-f21d-400c-ab01-81411e8ce804
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC036 Create a new obligation and see it in the list
- **Test Code:** [TC036_Create_a_new_obligation_and_see_it_in_the_list.py](./TC036_Create_a_new_obligation_and_see_it_in_the_list.py)
- **Test Error:** Creating the obligation did not add it to the obligations list. The application remained on the obligations empty state and the newly created item 'PL Obligation A' is not visible.

Observations:
- The New obligation dialog was opened and filled with Title 'PL Obligation A', Amount '250', Due date '2026-04-30'.
- After clicking 'Create obligation', the obligations area still showed the empty-state message 'No obligations'.
- An extraction of the obligations area did not list 'PL Obligation A'.
- Earlier navigation to /projects/new produced backend error toasts stating 'Request failed with status 404'.
- The dashboard and obligations UI are visible but persistence of new obligations appears to be failing (no new item shown).

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/2429e0f2-ee0c-4619-a303-733c90ad6d68
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC038 Submitting obligation with missing required fields shows inline validation errors
- **Test Code:** [TC038_Submitting_obligation_with_missing_required_fields_shows_inline_validation_errors.py](./TC038_Submitting_obligation_with_missing_required_fields_shows_inline_validation_errors.py)
- **Test Error:** Failed to replay step 001: HTML snapshot capture failed
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/d0a30f45-f43e-40fc-bb00-aa6fa98428f6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC040 Project Partners tab loads and shows partner balances or empty state
- **Test Code:** [TC040_Project_Partners_tab_loads_and_shows_partner_balances_or_empty_state.py](./TC040_Project_Partners_tab_loads_and_shows_partner_balances_or_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/88c1e4b0-e397-4b8b-9c00-a6e0e9d7c895
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC041 Create a settlement and see it listed with balances updated
- **Test Code:** [TC041_Create_a_settlement_and_see_it_listed_with_balances_updated.py](./TC041_Create_a_settlement_and_see_it_listed_with_balances_updated.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/0be3d814-f990-464f-a75f-2a10c8a3bb4a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC042 Delete a settlement and confirm it is removed with balances updated
- **Test Code:** [TC042_Delete_a_settlement_and_confirm_it_is_removed_with_balances_updated.py](./TC042_Delete_a_settlement_and_confirm_it_is_removed_with_balances_updated.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/b9d227f0-e046-40fc-ac1b-41c56db7ee99
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC044 Partners Directory loads and shows list or empty state
- **Test Code:** [TC044_Partners_Directory_loads_and_shows_list_or_empty_state.py](./TC044_Partners_Directory_loads_and_shows_list_or_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/938ca31c-a2cf-42dd-b019-fcf5f7d7243e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC045 Create a new partner from the directory
- **Test Code:** [TC045_Create_a_new_partner_from_the_directory.py](./TC045_Create_a_new_partner_from_the_directory.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/5a32cb41-a440-470e-9c7d-7031e673d5f6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC048 Edit partner information from detail page
- **Test Code:** [TC048_Edit_partner_information_from_detail_page.py](./TC048_Edit_partner_information_from_detail_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/11adbf5b-23fc-4a1e-86f4-9d80313d8435
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC049 Delete partner from detail page
- **Test Code:** [TC049_Delete_partner_from_detail_page.py](./TC049_Delete_partner_from_detail_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/d2ba1759-c9bb-4c15-ac58-deb9c61169b6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC051 Payment Methods page loads and shows list or empty state
- **Test Code:** [TC051_Payment_Methods_page_loads_and_shows_list_or_empty_state.py](./TC051_Payment_Methods_page_loads_and_shows_list_or_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/dfdd1f20-7138-4ace-923c-43495f7ca1bb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC052 Create a new payment method
- **Test Code:** [TC052_Create_a_new_payment_method.py](./TC052_Create_a_new_payment_method.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/192f79a1-b287-4646-93ac-ebb79582d1b6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC053 Edit payment method info from detail page
- **Test Code:** [TC053_Edit_payment_method_info_from_detail_page.py](./TC053_Edit_payment_method_info_from_detail_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/79c716d9-ea0d-45e9-b389-7ca12051af8a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC054 Delete a payment method from its detail page
- **Test Code:** [TC054_Delete_a_payment_method_from_its_detail_page.py](./TC054_Delete_a_payment_method_from_its_detail_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/1c535086-455f-4a4f-87a6-1b70f8552800
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC055 Creating a payment method without a required name shows validation error
- **Test Code:** [TC055_Creating_a_payment_method_without_a_required_name_shows_validation_error.py](./TC055_Creating_a_payment_method_without_a_required_name_shows_validation_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/9e580bfd-a8b1-47a2-b918-96955c449279
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Dashboard: Empty state when no data exists for the selected period
- **Test Code:** [TC009_Dashboard_Empty_state_when_no_data_exists_for_the_selected_period.py](./TC009_Dashboard_Empty_state_when_no_data_exists_for_the_selected_period.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/524b2e42-f32a-43cb-a69b-945dd138239c/1a9e9fd7-b2e2-41d6-9b83-769659ade3d4
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **80.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---