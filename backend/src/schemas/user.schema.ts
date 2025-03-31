export const createSerialisedInventoryRequest = yup
    .object()
    .shape({
        accessType: yup
            .string()
            .oneOf(
                inventoryAccessTypeDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryAccessTypeDropdowns}`
            )
            .required(SchemaErrorMessages.IS_REQUIRED),
        model: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
        materialCode: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
        maxSupportedDownloadSpeed: yup.number().required(SchemaErrorMessages.IS_REQUIRED),
        cardType: yup
            .string()
            .oneOf(
                inventoryCardTypeDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryCardTypeDropdowns}`
            ),
        cabinetType: yup.string(),
        materialName: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
        retrievalTagging: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
        modelStatus: yup
            .string()
            .oneOf(
                inventoryModelStatusDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryModelStatusDropdowns}`
            )
            .required(SchemaErrorMessages.IS_REQUIRED),
        itemName: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
        itemCode: yup.string(),
        inventoryType: yup
            .string()
            .oneOf(
                inventoryTypeDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryTypeDropdowns}`
            )
            .required(SchemaErrorMessages.IS_REQUIRED),
        unitOfMeasure: yup
            .string()
            .oneOf(
                inventoryUnitOfMeasureDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryUnitOfMeasureDropdowns}`
            )
            .required(SchemaErrorMessages.IS_REQUIRED)
    })
    .noUnknown(true, SchemaErrorMessages.NO_EXTRA_FIELDS);

export const updateSerialisedInventoryRequest = yup
    .object()
    .shape({
        model: yup.string().optional().nullable(),
        maxSupportedDownloadSpeed: yup.number().optional().nullable(),
        materialName: yup.string().optional().nullable(),
        retrievalTagging: yup.string().optional().nullable(),
        modelStatus: yup
            .string()
            .oneOf(
                inventoryModelStatusDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryModelStatusDropdowns}`
            )
            .optional()
            .nullable(),
        itemName: yup.string().optional().nullable(),
        itemCode: yup.string().optional().nullable(),
        inventoryType: yup
            .string()
            .oneOf(
                inventoryTypeDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryTypeDropdowns}`
            )
            .optional()
            .nullable(),
        unitOfMeasure: yup
            .string()
            .oneOf(
                inventoryUnitOfMeasureDropdowns,
                `${SchemaErrorMessages.MUST_BE_ONE_OF}: ${inventoryUnitOfMeasureDropdowns}`
            )
            .optional()
            .nullable()
    })
    .noUnknown(true, SchemaErrorMessages.NO_EXTRA_FIELDS);

export type CreateSerialisedInventoryRequest = yup.InferType<
    typeof createSerialisedInventoryRequest
>;
export type UpdateSerialisedInventoryRequest = yup.InferType<
    typeof updateSerialisedInventoryRequest
>;