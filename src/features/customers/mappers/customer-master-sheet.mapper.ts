import type { CustomerMasterSheetRow, ResolvedCustomerColumn } from "../config/customer-columns";
import type { Customer, LmcPipeSize, LmcPipeSizeRecord } from "../types/customer.types";

export function getCustomerMasterSheetRows(sourceCustomers: Customer[]): CustomerMasterSheetRow[] {
  return sourceCustomers.map((customer) => {
    const connection = customer.customerConnection;
    const gi = customer.giMeasurements;
    const valves = customer.valvesRegulators;
    const fittings = customer.fittingsAccessories;
    const lmc = customer.lmcPipelineWork;
    const mdpe = customer.mdpeFittings;
    const commissioning = customer.commissioningConversion;
    const billing = customer.billingCompletion;
    const pipe20 = getPipeRecord(lmc.pipeRecords, "20 mm");
    const pipe32 = getPipeRecord(lmc.pipeRecords, "32 mm");
    const pipe63 = getPipeRecord(lmc.pipeRecords, "63 mm");
    const pipe90 = getPipeRecord(lmc.pipeRecords, "90 mm");
    const pipe125 = getPipeRecord(lmc.pipeRecords, "125 mm");

    return {
      id: customer.id,
      customerId: customer.id,
      values: {
        customerName: connection.customerName,
        trBpNo: connection.trBpNo,
        reportNoGi: connection.reportNoGi,
        reportNoGc: connection.reportNoGc,
        reportNoConversion: connection.reportNoConversion,
        mobileNo: connection.mobileNo,
        fullAddress: connection.fullAddress,
        projectName: customer.projectName,
        siteArea: customer.siteArea,
        city: customer.city,
        status: customer.status,
        paymentStatus: String(billing.paymentStatus),
        paymentMode: billing.paymentMode,
        initialAmount: billing.initialAmount,
        kycVerified: customer.documents?.some(
          (document) =>
            document.category === "ID / Address Proof" &&
            document.status === "Approved",
        )
          ? "Yes"
          : "No",
        lastPaymentDate:
          billing.paymentStatus === "Completed"
            ? commissioning.conversionDate
            : "",
        scheme: connection.scheme,
        surveyId: customer.survey?.surveyId ?? "",
        surveyDate: customer.survey?.surveyDate ?? "",
        assignedSurveyor: customer.survey?.assignedSurveyor ?? "",
        submittedBy: customer.survey?.submittedBy ?? "",
        submissionDate: customer.survey?.submissionDate ?? "",
        latitude: customer.survey?.latitude != null ? String(customer.survey.latitude) : "",
        longitude: customer.survey?.longitude != null ? String(customer.survey.longitude) : "",
        captureAccuracy: customer.survey?.captureAccuracy ?? "",
        workableStatus: customer.survey?.workableStatus ?? "",
        surveyApprovalStatus: customer.survey?.approvalStatus ?? "",
        initialMeasurements: customer.survey?.initialMeasurements ?? "",
        siteAccessibility: customer.survey?.siteAccessibility ?? "",
        meterPlacement: customer.survey?.meterPlacement ?? "",
        pipelineRoute: customer.survey?.pipelineRoute ?? "",
        civilWorkRequired: customer.survey?.civilWorkRequired ?? "",
        obstaclesRemarks: customer.survey?.obstaclesRemarks ?? "",
        surveyNotes: customer.survey?.notes ?? "",
        surveyReason: customer.survey?.reason ?? "",
        surveyRecommendedAction: customer.survey?.recommendedAction ?? "",
        surveyExpectedResolutionDate: customer.survey?.expectedResolutionDate ?? "",
        surveyApprovalComments: customer.survey?.approvalComments ?? "",
        plumberName: connection.plumberName,
        meterNo: commissioning.meterNo,
        installationDate: commissioning.installationDate,
        jobCardDone: connection.jobCardDone,
        connectionType: connection.connectionType,
        houseType: connection.houseType,
        tfToRegulator: gi.tfToRegulator,
        inlet: gi.inlet,
        outlet: gi.outlet,
        totalGiPipeHalfInch: gi.totalGiPipeHalfInch,
        giPipeThreeQuarterInch: gi.giPipeThreeQuarterInch,
        giPipeOneInch: gi.giPipeOneInch,
        giPipeOneAndHalfInch: gi.giPipeOneAndHalfInch,
        giPipeTwoInch: gi.giPipeTwoInch,
        giApprovalStatus: gi.approvalStatus ?? "",
        giApprovalComments: gi.approvalComments ?? "",
        isolationValveHalfInch: valves.isolationValveHalfInch,
        isolationValveThreeQuarterInch: valves.isolationValveThreeQuarterInch,
        isolationValveOneInch: valves.isolationValveOneInch,
        isolationValveOneAndHalfInch: valves.isolationValveOneAndHalfInch,
        isolationValveTwoInch: valves.isolationValveTwoInch,
        applianceValveHalfInch: valves.applianceValveHalfInch,
        regulator6BarTo100Mbar: valves.regulator6BarTo100Mbar,
        regulator6BarTo21Mbar: valves.regulator6BarTo21Mbar,
        regulator100MbarTo21Mbar: valves.regulator100MbarTo21Mbar,
        warningPlate: valves.warningPlate,
        clampHalfInch: fittings.clampHalfInch,
        clamp3InchToHalfInch: fittings.clamp3InchToHalfInch,
        elbowHalfInch: fittings.elbowHalfInch,
        mfElbowHalfInch: fittings.mfElbowHalfInch,
        socketHalfInch: fittings.socketHalfInch,
        teeHalfInch: fittings.teeHalfInch,
        nipple2Inch: fittings.nipple2Inch,
        nipple3Inch: fittings.nipple3Inch,
        nipple4Inch: fittings.nipple4Inch,
        reducerElbowThreeQuarterToHalfInch: fittings.reducerElbowThreeQuarterToHalfInch,
        threeQuarterInchTo3Inch: fittings.threeQuarterInchTo3Inch,
        unionHalfInch: fittings.unionHalfInch,
        plugHalfInch: fittings.plugHalfInch,
        fittingsOneAndHalfInchQuantity: fittings.fittingsOneAndHalfInchQuantity,
        fittingsTwoInchQuantity: fittings.fittingsTwoInchQuantity,
        extraGiAbove10Metres: fittings.extraGiAbove10Metres,
        pipe20Length: pipe20?.lengthMetres ?? "",
        pipe20LayingDate: pipe20?.layingDate ?? "",
        pipe20TestingDate: pipe20?.testingDate ?? "",
        pipe20PurgingDate: pipe20?.purgingDate ?? "",
        pipe32Length: pipe32?.lengthMetres ?? "",
        pipe63Length: pipe63?.lengthMetres ?? "",
        pipe90Length: pipe90?.lengthMetres ?? "",
        pipe125Length: pipe125?.lengthMetres ?? "",
        fourMetresUnderGc: lmc.fourMetresUnderGc,
        fourMetresAboveGc: lmc.fourMetresAboveGc,
        tfHalfInch: lmc.tfHalfInch,
        tfOneInch: lmc.tfOneInch,
        pcc: lmc.pcc,
        rccNalaCrossing: lmc.rccNalaCrossing,
        paverBlocks: lmc.paverBlocks,
        malua: lmc.malua,
        hardRock: lmc.hardRock,
        civilRemarks: lmc.civilRemarks ?? "",
        lmcApprovalStatus: lmc.approvalStatus ?? "",
        lmcApprovalComments: lmc.approvalComments ?? "",
        saddle90To32Mm: mdpe.saddle90To32Mm,
        saddle90Mm: mdpe.saddle90Mm,
        saddle63To32Mm: mdpe.saddle63To32Mm,
        saddle32To20Mm: mdpe.saddle32To20Mm,
        tee32Mm: mdpe.tee32Mm,
        tee20Mm: mdpe.tee20Mm,
        reducerCoupler63To32Mm: mdpe.reducerCoupler63To32Mm,
        reducerCoupler32To20Mm: mdpe.reducerCoupler32To20Mm,
        coupler32Mm: mdpe.coupler32Mm,
        coupler20Mm: mdpe.coupler20Mm,
        coupler90Mm: mdpe.coupler90Mm,
        reducerCoupler90To63Mm: mdpe.reducerCoupler90To63Mm,
        tee90Mm: mdpe.tee90Mm,
        endCap90Mm: mdpe.endCap90Mm,
        commissioningDate: commissioning.commissioningDate,
        conversionDate: commissioning.conversionDate,
        regulatorPressure: commissioning.regulatorPressure,
        regulatorNo: commissioning.regulatorNo,
        meterType: commissioning.meterType,
        meterReading: commissioning.meterReading,
        nonConversionRemark: commissioning.nonConversionRemark,
        jmrDone: formatBoolean(billing.jmrDone),
        jmrSubmittedInPbg: formatBoolean(billing.jmrSubmittedInPbg),
        giBillDone: formatBoolean(billing.giBillDone),
        gcBillDone: formatBoolean(billing.gcBillDone),
        conversionBillDone: formatBoolean(billing.conversionBillDone),
        billingRemark: billing.remark,
        createdAt: customer.createdDate,
        updatedAt: customer.updatedDate,
        giCompletedOn: customer.completionAudit?.giCompletedOn ?? "",
        giCompletedBy: customer.completionAudit?.giCompletedBy ?? "",
        valvesCompletedOn: customer.completionAudit?.valvesCompletedOn ?? "",
        valvesCompletedBy: customer.completionAudit?.valvesCompletedBy ?? "",
        fittingsCompletedOn: customer.completionAudit?.fittingsCompletedOn ?? "",
        fittingsCompletedBy: customer.completionAudit?.fittingsCompletedBy ?? "",
        lmcCompletedOn: customer.completionAudit?.lmcCompletedOn ?? "",
        lmcCompletedBy: customer.completionAudit?.lmcCompletedBy ?? "",
        mdpeCompletedOn: customer.completionAudit?.mdpeCompletedOn ?? "",
        mdpeCompletedBy: customer.completionAudit?.mdpeCompletedBy ?? "",
        ...customer.customFields,
      },
    };
  });
}

export function warnIfMasterSheetProjectionIncomplete(
  resolvedColumns: ResolvedCustomerColumn[],
  rows: CustomerMasterSheetRow[],
): void {
  if (process.env.NODE_ENV === "production" || !rows.length) return;
  const projectedKeys = new Set(Object.keys(rows[0].values));
  const missing = resolvedColumns.filter((column) => !column.custom && !projectedKeys.has(column.key));
  if (missing.length) {
    console.error(
      `[customer-columns] Web table has no value projection for: ${missing.map((c) => c.key).join(", ")}. ` +
        "These are selectable in Customize Columns but will render blank until getCustomerMasterSheetRows is extended.",
    );
  }
}

function getPipeRecord(records: LmcPipeSizeRecord[], pipeSize: LmcPipeSize) {
  return records.find((record) => record.pipeSize === pipeSize);
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}
