const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, Header, Footer,
} = require("docx");
const BRAND = require("../../brand");

const FONT = BRAND.font;
const ORANGE = BRAND.colors.orange;

// ─── Reusable helpers ──────────────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, font: FONT, size: level === HeadingLevel.HEADING_1 ? 28 : 24, color: ORANGE }),
    ],
  });
}

function subheading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, font: FONT, size: 22, color: "333333" }),
    ],
  });
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text, font: FONT, size: 22, color: "333333", ...options }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 }, children: [] });
}

function definitionItem(term, definition) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `"${term}" `, font: FONT, size: 22, color: "333333", bold: true }),
      new TextRun({ text: definition, font: FONT, size: 22, color: "333333" }),
    ],
  });
}

// ─── Section builders — content preserved verbatim from Tavant MSA template ──
const sectionBuilders = {
  cover_page(data) {
    return [
      emptyLine(), emptyLine(), emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: BRAND.company.toUpperCase(), bold: true, font: FONT, size: 48, color: ORANGE }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Professional Services Agreement", bold: true, font: FONT, size: 36, color: "333333" }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `With ${data.customer_name || "________________________"}`, font: FONT, size: 28, color: "666666" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Effective Date: ${data.effective_date || "________, 20xx"}`, font: FONT, size: 22, color: "666666" }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Tavant Technologies, Inc. Confidential", font: FONT, size: 18, color: "999999", italics: true }),
        ],
      }),
    ];
  },

  preamble(data) {
    const custName = data.customer_name || "________________________";
    const custAddr = data.customer_address || "________________________";
    const effDate = data.effective_date || "________, 20xx";
    return [
      heading("Tavant Professional Services Agreement"),
      bodyText(
        `This Master Agreement is entered on ${effDate} (the "Effective Date") (the "Agreement"), between Tavant Technologies, Inc. located at 3945 Freedom Circle, Suite 600, Santa Clara, CA 95054 ("Tavant") and its Affiliates and, ${custName} located at ${custAddr} ("Customer").`
      ),
      emptyLine(),
      bodyText(
        `This Agreement governs the relationship of the parties for Professional Services provided by Tavant to Customer. Tavant and Customer agree to the following terms and conditions:`
      ),
    ];
  },

  definitions() {
    return [
      heading("1. Definitions"),
      bodyText("The following are defined terms:"),
      emptyLine(),
      definitionItem("Affiliate(s)", `means any entity which directly or indirectly controls, is controlled by, or is under common control with the subject entity. "Control," for purposes of this definition, means direct or indirect ownership or control of more than 50% of the voting interests of the subject entity.`),
      definitionItem("Acceptance or Accepted Date", `means the Date the Services are first accepted as provided in a SOW.`),
      definitionItem("Change Request", `means a request for a change in the SOW.`),
      definitionItem("Confidential Information", `means certain financial, technical, legal, marketing, network, and/or other business information, reports, records, or data (including, but not limited to, computer programs, code, systems, applications, analyses, passwords, procedures, output, information regarding software, sales data, vendor lists, customer lists, and other customer-related information, business strategies, advertising and promotional plans, creative concepts, specifications, designs, and/or other material) which the disclosing party deems, and the receiving party should consider, proprietary and/or confidential to (and of independent economic value to) the disclosing party. Confidential Information may be disclosed between parties by delivery, electronic or manual, access to networks or computers of the other party, or any other means in which the other party is in possession of Confidential Information of the other party.`),
      definitionItem("Content", `means any information, text, pictures, sound, or other content provided by a party in connection with the Services.`),
      definitionItem("Documentation", `means the hard copy and electronic version of documentation provided with the Services as stated in the SOW.`),
      definitionItem("Tavant's Confidential Information", `means Confidential Information that includes Tavant's software and Content.`),
      definitionItem("Intellectual Property Rights", `means all patents, patent rights, copyrights, moral rights, trade secret rights, trademark, service mark and trade dress rights and all other intellectual property rights, as may exist now and/or hereafter come into existence, including derivative rights, and all renewals and extensions thereof, under the laws of the United States.`),
      definitionItem("Law(s)", `means all federal, state and local laws, rules and regulations as now in effect and as amended from time to time that applies to Customer's business, including without limitation, all consumer protection and privacy laws, the Gramm-Leach Bliley Act (P.L. 106-102) (15 U.S.C. 6809), the Federal Truth-in-Lending Act, the Equal Credit Opportunity Act, the Fair Credit Reporting Act, and the Real Estate Settlement Procedures Act and each of their respective regulations.`),
      definitionItem("Customer's Confidential Information", `means Confidential Information that includes software owned by Customer and Content provided by Customer.`),
      definitionItem("Professional Services", `or "Services" means Tavant's services for the prices as stated in an SOW.`),
      definitionItem("Statement of Work or SOW", `means a written documents that specifies the terms and conditions of Professional Services provided by Tavant to Customer in the form attached as Exhibit A.`),
    ];
  },

  professional_services() {
    return [
      heading("2. Professional Services"),
      subheading("Services."),
      bodyText(
        `Tavant agrees to provide Customer Professional Services as set forth in each Statement of Work and shall be attached as an amendment to Exhibit A this Agreement (each a "Project"). The parties may change the services provided any changes are made in writing and signed by authorized agents for both parties as specified in the SOW.`
      ),
      emptyLine(),
      bodyText(
        `In the event that the terms of an SOW conflict with the terms contained in another SOW, the terms contained in the SOW executed later in time shall prevail. In the event of a conflict between the terms of an SOW and the Agreement, the SOW will control.`
      ),
      emptyLine(),
      subheading("Dates."),
      bodyText(
        `Customer acknowledges that any dates provided herein are reasonable estimates, which are in turn based on the timely submission by Customer of all specifications and other information necessary for the completion of tasks set forth in the applicable SOW.`
      ),
      emptyLine(),
      subheading("Tavant Personnel."),
      bodyText(
        `Tavant will provide personnel, which it judges to be adequate to render the Services. In the event that any Tavant staff is found to be unacceptable to Customer, Customer shall notify Tavant of such fact and Tavant shall work with Customer to resolve the problem using actions up to and including removal of staff and providing a replacement acceptable to Customer.`
      ),
      emptyLine(),
      subheading("Independent Contractor."),
      bodyText(
        `Tavant is an independent contractor. Neither Tavant nor Tavant's employees are, or shall be deemed for any purpose to be, employees of Customer. Customer shall not be responsible to Tavant, Tavant's employees or any governing body for any payroll related taxes related to the performance of the Services.`
      ),
      emptyLine(),
      subheading("Customer Obligations."),
      bodyText(
        `Customer shall designate a project manager at the onset of the Professional Services, who shall act as a liaison between Customer and Tavant. In addition, Customer may need to provide technical and business personnel as required. Tavant and Customer Project Managers shall hold meetings and issue reports as the parties deem necessary to complete the services. Customer shall provide all required software, hardware, access and facilities for Tavant to Provide the Services.`
      ),
      emptyLine(),
      subheading("Change Order Process."),
      bodyText(
        `If Customer believes that a change in a Statement of Work (whether in time frames, costs or Work Product) is necessary or desirable, Customer will submit a written change order to Tavant describing the requested changes (a "Change Order"). Upon receipt or generation of such a Change Order, Tavant will promptly provide Customer with a written quote describing in detail: (i) the modifications to the Professional Services that would be required to effectuate the Change Order; (ii) the effect, if any, of the Change Order on any applicable performance milestones; and (iii) the effect, if any, that implementing the Change Order will have on the overall cost of the Professional Services under the applicable Statement of Work. The parties will thereafter discuss Tavant's quote in good faith with a goal of executing a mutually acceptable Change Order. Notwithstanding the foregoing, a Change Order will not become effective unless and until it is executed by an authorized representative of each party. Absent the execution of the Change Order, the parties will proceed to fulfill their obligations under the applicable Statement of Work in accordance with its original terms.`
      ),
    ];
  },

  acceptance_and_fees() {
    return [
      heading("3. Acceptance and Fees"),
      subheading("Review and Acceptance."),
      bodyText(
        `Unless otherwise mentioned in the SOW, upon delivery of the Professional services to Customer, Customer will review and examine the Professional Services. The Professional Services is deemed accepted when either (a) Customer has signed a formal request of acceptance or (b) Customer has commercially used the Professional Services in production, or (c) twenty (20) days after Tavant has delivered the Professional Services to Customer unless Customer has submitted in writing the specific reasons for nonconformance of the Professionals Services, whichever occurs first.`
      ),
      emptyLine(),
      subheading("Professional Service Fees."),
      bodyText(
        `Customer shall pay Tavant the fees as set forth in the SOW. Unless otherwise stated in the SOW, all services provided hereunder are presumed to be provided by Tavant on a time and materials basis based on Tavant's then-current rate.`
      ),
      emptyLine(),
      subheading("Fees for Time and Materials."),
      bodyText(
        `For Projects based on time and materials, fees for services performed shall be invoiced semi-monthly on the 16th and end of each month. Customer agrees to pay the full amount due within thirty (30) calendar days of date of the invoice date.`
      ),
      emptyLine(),
      subheading("Fees for Fixed Rate."),
      bodyText(
        `For Projects based on a fixed rate, fees will be paid as provided in the SOW which may include milestones or level of effort partial payments. Customer agrees to pay the full amount due within thirty (30) calendar days of the invoice date.`
      ),
      emptyLine(),
      subheading("Expense Reimbursement."),
      bodyText(
        `In addition to the foregoing, Customer agrees to reimburse Tavant for actual out-of-pocket expenses, including but not limited to expenses for travel and lodging, reasonably incurred by Tavant in performance of its obligations hereunder, for which Customer agrees to pay the full amount due within thirty (30) calendar days of the date of applicable invoice date.`
      ),
      emptyLine(),
      subheading("Cost of Living Adjustment."),
      bodyText(
        `Based on mutual agreement, once per calendar year, Tavant shall increase and adjust the rates/fees for all applicable SOWs under this Agreement, upon thirty (30) days written notice to Customer, provided that the amount of any such increase will not exceed five percent (5%). All price increases shall become effective thirty (30) days after Tavant delivers written notice thereof to the Customer.`
      ),
      emptyLine(),
      subheading("Promotion of Tavant Personnel."),
      bodyText(
        `Customer acknowledges that the rates/fees of Tavant's Personnel who are assigned to its projects are based on seniority of the role as stated in the applicable SOW. Customer further acknowledges that some personnel may gain general and specific expertise that may qualify them to be considered for a promotion. Based on mutual agreement, Tavant shall evaluate all personnel assigned, once every twelve (12) months, and reserves the right to promote those individual personnel at its discretion. Tavant shall notify the Customer in writing of any such promotion of a personnel that has rendered services in connection with this Agreement for at least six (6) consecutive months. Tavant will maintain the pricing for a period of up to two (2) months thereof, after which term the Parties will mutually agree to either (i) adjust the pricing to reflect the promotion of the individual personnel, or (ii) replace the individual personnel with new personnel of similar skills and experience.`
      ),
      emptyLine(),
      subheading("Late Fees."),
      bodyText(
        `Interest shall accrue at the lesser of 1.5% per month or the maximum amount permitted by applicable law ("Late Fee") for any unpaid fees. In the event of a dispute made in good faith as to the amount of fees, Customer agrees to remit payment on any undisputed amount(s). Any dispute to the invoice shall be raised by the Customer within ten (10) days of receipt of such invoice.`
      ),
    ];
  },

  ownership() {
    return [
      heading("4. Ownership"),
      bodyText(
        `Tavant agrees that all Work Product shall be the sole and exclusive property of Customer and may be used by Customer for any purpose whatsoever without Tavant's consent, and without obligation of any further compensation to Tavant and shall be delivered by Tavant to Customer. For the purposes of this Agreement, "Work Product" means all ideas, inventions, improvements, documents, information or other data that Tavant generates or develops while rendering the Services, including but not limited to any and all source and object code, applicable documentation, information, data, models, equations, studies, calculations, solutions, reports, drawings, process flows, modifications and/or adaptations of existing Customer software and inventions developed or reduced to practice by Tavant as a result of the Services. All Work Product shall be considered "works made for hire" and, to the extent that they are not, all right, title and interest in such materials shall be assigned to Customer. Tavant hereby assigns to Customer any and all rights which Tavant may have in the Work Product.`
      ),
      emptyLine(),
      bodyText(
        `Notwithstanding the foregoing, Tavant solely owns all right, title and interest, including all intellectual property rights in and to, the "Background Intellectual Property", which for the purposes of this Agreement means all inventions, developments, software, deep learning processors, neural processing units, accelerators, products and technology created, provided or made available by Tavant prior to Tavant's provision of the Services or otherwise created by Tavant independent of the Services, and all improvements, modifications, or enhancements in or to the foregoing. For clarity, Background Intellectual Property is not, and is specifically excluded from, the Work Product and Services. Tavant hereby grants the Customer and its Affiliates the perpetual, non-exclusive, royalty-free license to use any Background Intellectual Property that Tavant, pursuant to an SOW, incorporates into the Work Product, solely to the extent necessary for Customer to exploit such Work Product for the Customer's own internal purposes. Customer will not be permitted to resell, sublicense, or otherwise commercialize the Background Intellectual Property. Further, Tavant may develop code, customization, and configuration on Knowledge.AI under this SOW specifically for use by Customer in connection with the Work Product; and in such cases the customizations, configurations and code built on Knowledge.AI shall be owned by the Customer. For clarity, nothing in this Agreement will be construed to limit or restrict Tavant from using or licensing its Background Intellectual Property freely and no rights are granted to use Background IP separate from the Work Product into which it was incorporated.`
      ),
      emptyLine(),
      bodyText(
        `Notwithstanding anything to the contrary in this Agreement, Tavant will be free to use all Residuals for any purpose. For the purposes of this Agreement, "Residuals" means any general learning, skills, ideas, concepts, techniques or know-how or other information retained in the unaided memory of its personnel who had access to or worked with Customer. Tavant is not required to limit or restrict the work assignments of any of related personnel or to pay Customer any amount for any work resulting from the use of the Residuals.`
      ),
      emptyLine(),
      bodyText(
        `Tavant shall not incorporate any third party materials into the Work Product and deliverables except to the extent that (i) such third party materials are specifically identified on the Statement of Work as "Third Party Materials". Tavant does not transfer or procure any right, title or interest to the Customer in connection with such Third-Party Materials as are specifically identified in the SOW, and Customer is to be solely responsible for obtaining all permits or licenses and paying all fees required for the use of such Third Party Materials as are identified in the SOW.`
      ),
      emptyLine(),
      subheading("Notices."),
      bodyText(
        `Neither party shall remove any copyright or other proprietary rights notices of the other party on any software or other materials provided by the other party under this Agreement.`
      ),
    ];
  },

  confidentiality() {
    return [
      heading("5. Confidential Information and Data Protection"),
      subheading("Nondisclosure."),
      bodyText(
        `Tavant agrees (a) to hold Customer's Confidential Information in strict confidence, (b) not to disclose Customer's Confidential Information to any third party, and (c) not to use Customer's Confidential Information for any purpose other than as permitted by this Agreement. Customer agrees (a) to hold Tavant's Confidential Information in strict confidence, (b) not to disclose Tavant's Confidential Information to any third party, and (c) not to use Tavant's Confidential Information for any purpose other than as permitted by this Agreement.`
      ),
      emptyLine(),
      bodyText(
        `Each party may disclose the other party's Confidential Information to its employees or authorized contractors who (i) have executed or are otherwise knowingly bound by a non-disclosure agreement requiring such employee or contractor to hold in confidence all third party confidential information obtained in connection with such employment or consultancy and (ii) have a bona fide need to know such information, but only to the extent necessary to carry out this Agreement. Each party agrees to instruct all such employees and consultants not to disclose such Confidential Information to third parties without the prior written permission of the disclosing party. Upon termination or expiration of this Agreement, the receiving party will promptly return to the disclosing party all tangible items containing or consisting of the disclosing party's Confidential Information.`
      ),
      emptyLine(),
      subheading("Exceptions."),
      bodyText(
        `Notwithstanding the foregoing, Confidential Information does not include information which: is now, or hereafter becomes, through no act or failure to act on the part of the receiving party, generally known or available to the public; was acquired by the receiving party before receiving such information from the disclosing party and without restriction as to use or disclosure; is hereafter rightfully furnished to the receiving party by a third party, without restriction as to use or disclosure; is information which the receiving party can document was independently developed by the receiving party without use of the disclosing party's Confidential Information; or, is disclosed pursuant to the lawful requirement or order of a court or governmental agency, provided that, upon the receiving party's request for such a disclosure, the receiving party gives prompt notice thereof to the disclosing party (unless such notice is not possible under the circumstances) so that the disclosing party may have the opportunity to intervene and contest such disclosure and/or seek a protective order or other appropriate remedy.`
      ),
      emptyLine(),
      subheading("Privacy and Protection of Customer Data Personally Identifiable Information."),
      bodyText(
        `To the extent that Tavant has access to Personally Identifiable Information provided by Customer's employees or customers, Tavant acknowledges and agrees that it shall not use or disclose Personally Identifiable Information for any purpose not reasonably required to comply with all applicable terms, conditions, provisions, and service levels of this Agreement without Customer's and the Customer's prior written consent. In the event that Customer has provided consent, Tavant may disclose such Personally Identifiable Information only to the extent permitted by such Customer and only in accordance with the terms of this Agreement and applicable Law. These obligations shall survive termination of this Agreement.`
      ),
      emptyLine(),
      subheading("Confidentiality of this Agreement."),
      bodyText(
        `Customer and Tavant shall keep confidential the prices, terms, and conditions of this Agreement, without disclosure to third parties; provided, however, that either party may disclose the prices, terms and conditions of this Agreement to its attorneys and accountants as necessary in the ordinary course of its business, provided that each such attorney and/or accountant is bound by confidentiality obligations to Customer or Tavant, as Applicable, prohibiting the further disclosure of such information.`
      ),
      emptyLine(),
      subheading("Data Protection and Use Restrictions"),
      emptyLine(),
      bodyText("Data Residency:", { bold: true, italics: true }),
      bodyText(
        `Customer Data will reside and be processed within Customer's designated Azure environment. Tavant shall access such data remotely for the purpose of performing the Services. Tavant shall not intentionally transfer Customer Data outside Customer's Azure environment except (a) as necessary for providing the Services, (b) for system maintenance, troubleshooting, or backup performed in a secure and compliant manner, or (c) as otherwise approved in writing by Customer.`
      ),
      emptyLine(),
      bodyText("Use Restrictions:", { bold: true, italics: true }),
      bodyText(
        `Tavant shall use Customer Data solely for performing the Services under this Agreement. Tavant shall not intentionally copy, export, or use Customer Data for unrelated internal purposes, including testing or model training, unless explicitly authorized by Customer in writing.`
      ),
      emptyLine(),
      bodyText("Audit Rights:", { bold: true, italics: true }),
      bodyText(
        `Customer may, no more than once annually and upon at least thirty (30) days' prior written notice, request a review of Tavant's compliance with its data handling obligations. Such review shall be limited to relevant documentation and certifications demonstrating compliance (e.g., SOC 2, ISO 27001) and will not include direct system access. Any on-site or expanded audit shall be mutually agreed, conducted during normal business hours, and subject to reasonable confidentiality and security restrictions.`
      ),
      emptyLine(),
      bodyText("Data Deletion:", { bold: true, italics: true }),
      bodyText(
        `Upon completion or termination of the Services, and subject to receipt of all due payments, Tavant shall upon request, within sixty (60) days, delete or return Customer Data that is in its possession, except for (a) data retained in accordance with Tavant's standard backup or archival procedures (which will remain protected under this Agreement), or (b) data required to be retained under applicable law. Upon written request, Tavant shall confirm such deletion or retention in writing.`
      ),
    ];
  },

  warranties() {
    return [
      heading("6. Warranties"),
      subheading("DISCLAIMER."),
      bodyText(
        `EXCEPT AS SET FORTH IN THIS SECTION, NEITHER PARTY MAKES ANY WARRANTIES CONCERNING THE PROFESSIONAL SERVICES, OR EITHER PARTY'S CONTENT, WHETHER EXPRESS, IMPLIED OR OTHERWISE, AND EACH PARTY SPECIFICALLY DISCLAIMS THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT WITH RESPECT THERETO. WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, TAVANT SPECIFICALLY DOES NOT WARRANT THAT THE SERVICES WILL PERFORM WITHOUT INTERRUPTION OR ERROR. EXCEPT AS OTHERWISE SET FORTH IN THIS AGREEMENT, TAVANT WILL NOT BE LIABLE FOR ANY DAMAGES THE CUSTOMER OR ITS CUSTOMERS MAY SUFFER ARISING OUT OF USE, OR INABILITY TO USE THE SERVICES PROVIDED HEREUNDER. TAVANT WILL NOT BE LIABLE FOR FAILURE OF THE INTERNET OR TELECOMMUNICATIONS ERRORS. CUSTOMER ACKNOWLEDGES AND UNDERSTANDS THAT NO NETWORK SECURITY PROGRAM CAN ASSURE COMPLETE NETWORK SECURITY OR PREVENT ALL UNAUTHORIZED ACCESS TO ITS NETWORK.`
      ),
    ];
  },

  indemnification() {
    return [
      heading("7. Indemnification and Insurance"),
      subheading("By Tavant."),
      bodyText(
        `Tavant shall indemnify, defend and hold harmless Customer, its officers, directors, employees and agents from and against all losses, costs, damages, judgments, settlements, penalties, liabilities and expenses (including reasonable attorneys' fees) arising out of third party claims that (a) any Tavant intellectual property used in the Services infringes or misappropriates any valid Intellectual Property Right provided, however, that Customer (i) notifies Tavant promptly in writing of the claim, (ii) provides reasonable assistance in connection with the defense and/or settlement thereof, and (iii) permits Tavant to control the defense and/or settlement thereof.`
      ),
      emptyLine(),
      subheading("Limitations."),
      bodyText(
        `Tavant's obligation to indemnify Customer for infringement claims shall not apply to the extent that any such third party claim arises out of (a) any Customer trademarks or Customer-provided Content (b) any infringement or claim, litigation or other proceedings to the extent arising solely and exclusively out of (x) any Content or any instruction, information, designs, or specifications provided by Customer to Tavant, (y) use of the Services or Work Product by Customer in combination with any materials or equipment not supplied, authorized or specified by Tavant, if the infringement would have been avoided by the use of the Services or Work Product not so combined, and (z) any modifications or changes made to the Services or Work Product by or on behalf of any person other than Tavant.`
      ),
      emptyLine(),
      subheading("Tavant Options."),
      bodyText(
        `In the event of an infringement action against Customer in connection with the Services, or in the event Tavant believes such a claim is likely, Tavant shall be entitled, at its option but without obligation or additional cost to Customer, to (i) appropriately modify or replace the Services with functionality which is functionally similar in all material respects and which, in Tavant's opinion, does not infringe any third party intellectual property rights; (ii) obtain a license with respect to the applicable third party intellectual property rights; or (iii) if neither (i) nor (ii) is commercially practicable, immediately terminate this Agreement and all obligations hereunder, and to provide Customer with: a prorated refund for the Service fees paid to Tavant for the affected Services (assuming straight line depreciation amortized over three years).`
      ),
      emptyLine(),
      subheading("By Customer."),
      bodyText(
        `Except for any claims for which Tavant is obligated to indemnify Customer, Customer shall indemnify, defend and hold harmless Tavant, its officers, directors, employees and agents from and against all losses, costs, damages, judgments, settlements, penalties, liabilities and expenses (including reasonable attorneys' fees) arising out of third party claims that (a) any Customer intellectual property used in the Services infringes or misappropriates any valid Intellectual Property Right and (b) Customer violated any privacy rights of third parties while using the Services; provided, however, that Tavant (i) notifies Customer promptly in writing of the claim, (ii) provides reasonable assistance in connection with the defense and/or settlement thereof, and (iii) permits Customer to control the defense and/or settlement thereof.`
      ),
      emptyLine(),
      subheading("Insurance."),
      bodyText(
        `At all times during the term of the Agreement, Tavant shall have in force, at its own expense, the following insurance and shall insure the risks associated with the Agreement with coverage and minimum limits as set forth below:`
      ),
      emptyLine(),
      bodyText(
        `Workers' Compensation Insurance in accordance with statutory requirements of the state where the work is performed and Employers' Liability Insurance with limits of not less than:`
      ),
      bodyText(`  Bodily Injury by Accident: $500,000 Each Accident`),
      bodyText(`  Bodily Injury by Disease: $500,000 Policy Limit`),
      bodyText(`  Bodily Injury by Disease: $500,000 Each Employee`),
      emptyLine(),
      bodyText(`All work place locations involved in the Agreement should be covered.`),
      emptyLine(),
      bodyText(
        `Commercial General Liability Insurance, written on an occurrence basis, with limits of $1,000,000 per occurrence and $2,000,000 aggregate Bodily Injury and Property Damage.`
      ),
      emptyLine(),
      bodyText(
        `Comprehensive Automobile Liability Insurance covering hired and non-owned vehicles with limits of $1,000,000.00 per occurrence and Bodily Injury and Property Damage combined single limits.`
      ),
      emptyLine(),
      bodyText(
        `Umbrella Liability Insurance with limits of $3,000,000. The Umbrella Liability Insurance would be in excess of the Commercial General Liability and Comprehensive Automobile Liability Insurance coverage.`
      ),
      emptyLine(),
      bodyText(
        `Tavant shall furnish a copy of a Certificate of Insurance evidencing the coverage required upon request from Customer.`
      ),
    ];
  },

  limitation_of_liability() {
    return [
      heading("8. Limitation of Liability"),
      bodyText(
        `IN NO EVENT WILL TAVANT OR CUSTOMER BE LIABLE TO THE OTHER UNDER THIS AGREEMENT FOR ANY SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES, WHETHER BASED ON BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE) OR OTHERWISE, WHETHER OR NOT THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF THE ESSENTIAL PURPOSE OF ANY REMEDY. THE LIABILITY OF ANY PARTY FOR DAMAGES OR ALLEGED DAMAGES HEREUNDER, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, IS LIMITED TO, AND WILL NOT EXCEED, THE AMOUNTS PAID AND DUE TO TAVANT DURING THE SIX MONTHS PRECEDING THE BREACH THAT LED TO THE CLAIM.`
      ),
      emptyLine(),
      bodyText(
        `NOTWITHSTANDING THE FOREGOING, THE LIMITATIONS OF LIABILITY SET FORTH ABOVE SHALL NOT APPLY TO THE FOLLOWING: (I) EACH PARTY'S RESPECTIVE INDEMNIFICATION OBLIGATIONS; (II) EITHER PARTY'S BREACH OF ITS CONFIDENTIALITY OBLIGATIONS; AND/OR (III) THE WILLFUL MISCONDUCT AND/OR INTENTIONAL OR GROSSLY NEGLIGENT ACTIONS OF EITHER PARTY HEREUNDER. NOTWITHSTANDING THE FOREGOING, IN NO EVENT WILL EITHER PARTY'S CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO EXCLUDED CLAIMS EXCEED TWO TIMES THE GENERAL CAP.`
      ),
    ];
  },

  term_and_termination() {
    return [
      heading("9. Term and Termination"),
      subheading("Term."),
      bodyText(
        `The term of this Agreement shall be effective as of the Effective Date and shall remain in effect until terminated as set forth herein (the "Term"). Either party may terminate this Agreement immediately upon written notice to the other party in the event that there are no Statements of Work in effect as of the date of termination. Beginning of the Calendar year the professional service rates will be updated to Tavant's then current rates.`
      ),
      emptyLine(),
      subheading("Termination."),
      bodyText(
        `Either party may terminate this Agreement immediately by giving notice to the other party if the other party: becomes insolvent; files a petition in bankruptcy; makes an assignment for the benefit of creditors; or commits a material breach of any of its obligations under this Agreement and such breach is not cured within thirty (30) days after notice of such breach is provided by the non-breaching party.`
      ),
      emptyLine(),
      bodyText(
        `Notwithstanding the foregoing, either party can terminate this Agreement or any applicable Statement of Work upon thirty (30) days written notice to other party.`
      ),
      emptyLine(),
      subheading("Obligations Upon Termination."),
      bodyText(
        `Customer shall pay all amounts due including amounts for work in process within 15 days. Each party will promptly return and/or destroy (as directed by the other party) all Confidential Information and Customer-provided equipment. To assist Customer to effect a smooth transition upon termination, Tavant shall, upon request, propose a transition support plan on a time-and-materials basis at its then-prevailing rates or as the parties may agree. Customer shall have the continued right to use any deliverables pursuant to the terms of the SOW and or any other applicable license agreement that have been paid for before termination or as provided under this section. In the event that this Agreement is terminated in pursuant to this section by Customer or Tavant, Customer shall immediately make all undisputed payments due hereunder for services rendered by Vendor in accordance with any Statement of Work. Deliverables that are not yet completed and not delivered shall be billed to Customer on a percentage of completion basis or time and materials based on work performed.`
      ),
    ];
  },

  general_provisions() {
    return [
      heading("10. General Provisions"),
      subheading("Governing Law and Venue."),
      bodyText(
        `This Agreement and any disputes arising under, in connection with, or relating to this Agreement will be governed by the laws of the State of California, excluding its conflicts of law rules. Venue shall be in Santa Clara County.`
      ),
      emptyLine(),
      subheading("Compliance with Laws."),
      bodyText(
        `Each party will perform all of its activities, obligations and responsibilities contemplated under this Agreement in compliance with all applicable Laws and will obtain all licenses or permits as may be required by any applicable Laws in order to conduct the activities contemplated hereunder. Each party shall be responsible for all applicable customer privacy and consumer legal disclosures and regulatory compliance required or recommended under applicable Laws for each party's respective business. Each party shall, as applicable: (a) acquire and maintain in effect all governmental regulatory authorizations, licenses and permits of every type from every state or federal agency necessary for the business and operations of each respective party; and (b) otherwise arrangements to operate in compliance with applicable Laws. Each party is responsible for legal compliance and monitoring of its own respective website for legal and regulatory compliance.`
      ),
      emptyLine(),
      subheading("Assignment."),
      bodyText(
        `Neither party may assign or transfer its rights or obligations under this Agreement without the prior written permission of the other party, except in connection with a merger, consolidation, or sale of all or substantially all of a party's assets. This Agreement shall be binding upon, and inure to the benefit of, the permitted successors and assigns of each party. Any attempt to transfer, sublicense or assign any of the rights or duties in violation of this Section is prohibited and shall be null and void.`
      ),
      emptyLine(),
      subheading("Relationship of Parties."),
      bodyText(
        `Neither this Agreement nor the parties' business relationship established hereunder will be construed as a partnership, franchise, joint venture, or agency relationship. Unless otherwise mutually agreed to by the parties in writing, the parties agree that they will not hire or solicit the employment of any personnel of the other party during the term of this agreement and for a period of one (1) year after the termination of this agreement.`
      ),
      emptyLine(),
      subheading("Waiver."),
      bodyText(
        `No waiver of any breach of any provision of this Agreement will be considered to be a waiver of any prior, concurrent or later breach of the same provisions or different provisions, and will not be effective unless made in writing and signed by an officer of the waiving party.`
      ),
      emptyLine(),
      subheading("Survival."),
      bodyText(
        `Sections 1, 7, 8 and 10 shall survive any termination or expiration of this Agreement.`
      ),
      emptyLine(),
      subheading("Force Majeure."),
      bodyText(
        `Neither party will have any liability to the other under, in connection with, or for any reason relating to, this Agreement as a result of any failure of performance as a result of an event of "force majeure." For purposes of this Agreement, "force majeure" means an event beyond a party's reasonable control whether or not foreseeable and includes, in any case, the following events that may prevent or significantly hinder a party from performing this Agreement or acting in connection with this Agreement: armed conflicts, terrorist act, famine, floods, Acts of God, labor strikes or shortages, governmental decree or regulation, court order, severe weather, fire, earthquake, failure of suppliers and breakdowns in communications transport facilities that are not attributable to the acts or omissions of either party. Upon receipt of such notice, this Agreement shall immediately be suspended. If the period of nonperformance exceeds fifteen (15) business days from the receipt of notice of the force majeure, the party whose ability to perform has not been so affected may by given written notice to terminate this Agreement. However, (i) delays in delivery due to force majeure shall automatically extend the delivery date for a period equal to the duration of such force majeure event; and (ii) any warranty period affected by a force majeure shall likewise be extended for a period of time equal to the duration of such force majeure event. This clause does not extend to suspend the payment obligations of the Customer.`
      ),
      emptyLine(),
      subheading("Notices."),
      bodyText(
        `Any notice required or permitted by this Agreement shall be in writing and shall be sent by any means reasonably used to provide the other party with notice such as a softcopy (facsimile, e-mail) or hard copy (mail, overnight carrier or hand delivery). Notice shall be addressed to the other party at the address listed above or at such other address for which such party gives notice is should be aware. Notice shall be deemed to have been given when the hard copy is received or three days after a softcopy and hard copy are sent, whichever is earlier.`
      ),
      emptyLine(),
      subheading("Entire Agreement."),
      bodyText(
        `This Agreement, including its Exhibits, constitutes the entire agreement of the parties with respect to the subject matter hereof, and supersedes all prior or contemporaneous understandings or agreements, whether written or oral. This Agreement may not be modified or altered except by written instrument duly executed by both parties.`
      ),
      emptyLine(),
      subheading("Severability."),
      bodyText(
        `If any provision of this Agreement is found invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the other provisions of this Agreement will remain in force.`
      ),
      emptyLine(),
      subheading("NO Publicity."),
      bodyText(
        `Unless required by Law, no party will, without the prior written approval of the other party, make any public statement, press release, presentation, or other announcement relating to the existence or terms of this Agreement. Tavant shall have the right to use Customer name and logo for its website and sales collateral referencing it as a customer.`
      ),
    ];
  },

  signatures(data) {
    return [
      heading("SIGNATURES"),
      bodyText("IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be duly executed as of the Effective Date."),
      emptyLine(), emptyLine(),
      bodyText("TAVANT TECHNOLOGIES, INC.", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Name: ${data.tavant_signatory || "_______________________"}`),
      bodyText(`Title: ${data.tavant_title || "_______________________"}`),
      bodyText("Date: _______________________"),
      emptyLine(), emptyLine(),
      bodyText(data.customer_name || "CUSTOMER", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Name: ${data.customer_signatory || "_______________________"}`),
      bodyText(`Title: ${data.customer_title || "_______________________"}`),
      bodyText("Date: _______________________"),
    ];
  },
};

module.exports = sectionBuilders;
