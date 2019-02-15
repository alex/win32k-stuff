"use strict";

const EXCLUDED_WIN32K_SYSCALLS = [
    // These are all called from the core event loop, and are thus incredibly
    // high volume, making the browser basically unusable if they're logged.
    // We're already aware that they're an issue, so don't log them for now.
    "NtUserPeekMessage",
    "NtUserValidateHandleSecure",
    "NtUserPostMessage",

    // Called on every vsync tick.
    "NtGdiDdDDIGetDeviceState"
];

const WIN32K_SYSCALLS = [
    "NtBindCompositionSurface",
    "NtCompositionInputThread",
    "NtCompositionSetDropTarget",
    "NtCreateCompositionInputSink",
    "NtCreateCompositionSurfaceHandle",
    "NtCreateImplicitCompositionInputSink",
    "NtDCompositionAddCrossDeviceVisualChild",
    "NtDCompositionBeginFrame",
    "NtDCompositionCommitChannel",
    "NtDCompositionCommitSynchronizationObject",
    "NtDCompositionConfirmFrame",
    "NtDCompositionConnectPipe",
    "NtDCompositionCreateAndBindSharedSection",
    "NtDCompositionCreateChannel",
    "NtDCompositionCreateConnection",
    "NtDCompositionCreateDwmChannel",
    "NtDCompositionCreateSharedVisualHandle",
    "NtDCompositionCurrentBatchId",
    "NtDCompositionDestroyChannel",
    "NtDCompositionDestroyConnection",
    "NtDCompositionDiscardFrame",
    "NtDCompositionDuplicateHandleToProcess",
    "NtDCompositionDuplicateSwapchainHandleToDwm",
    "NtDCompositionEnableDDASupport",
    "NtDCompositionEnableMMCSS",
    "NtDCompositionGetChannels",
    "NtDCompositionGetConnectionBatch",
    "NtDCompositionGetDeletedResources",
    "NtDCompositionGetFrameLegacyTokens",
    "NtDCompositionGetFrameStatistics",
    "NtDCompositionGetFrameSurfaceUpdates",
    "NtDCompositionProcessChannelBatchBuffer",
    "NtDCompositionReferenceSharedResourceOnDwmChannel",
    "NtDCompositionRegisterThumbnailVisual",
    "NtDCompositionRegisterVirtualDesktopVisual",
    "NtDCompositionReleaseAllResources",
    "NtDCompositionRemoveCrossDeviceVisualChild",
    "NtDCompositionRetireFrame",
    "NtDCompositionSetChannelCallbackId",
    "NtDCompositionSetChannelCommitCompletionEvent",
    "NtDCompositionSetChildRootVisual",
    "NtDCompositionSetDebugCounter",
    "NtDCompositionSubmitDWMBatch",
    "NtDCompositionSynchronize",
    "NtDCompositionTelemetryAnimationScenarioBegin",
    "NtDCompositionTelemetryAnimationScenarioReference",
    "NtDCompositionTelemetryAnimationScenarioUnreference",
    "NtDCompositionTelemetrySetApplicationId",
    "NtDCompositionTelemetryTouchInteractionBegin",
    "NtDCompositionTelemetryTouchInteractionEnd",
    "NtDCompositionTelemetryTouchInteractionUpdate",
    "NtDCompositionUpdatePointerCapture",
    "NtDCompositionWaitForChannel",
    "NtDesktopCaptureBits",
    "NtDuplicateCompositionInputSink",
    "NtGdiAbortDoc",
    "NtGdiAbortPath",
    "NtGdiAddEmbFontToDC",
    "NtGdiAddFontMemResourceEx",
    "NtGdiAddFontResourceW",
    "NtGdiAddInitialFonts",
    "NtGdiAddRemoteFontToDC",
    "NtGdiAddRemoteMMInstanceToDC",
    "NtGdiAlphaBlend",
    "NtGdiAngleArc",
    "NtGdiAnyLinkedFonts",
    "NtGdiArcInternal",
    "NtGdiBRUSHOBJ_DeleteRbrush",
    "NtGdiBRUSHOBJ_hGetColorTransform",
    "NtGdiBRUSHOBJ_pvAllocRbrush",
    "NtGdiBRUSHOBJ_pvGetRbrush",
    "NtGdiBRUSHOBJ_ulGetBrushColor",
    "NtGdiBeginGdiRendering",
    "NtGdiBeginPath",
    "NtGdiBitBlt",
    "NtGdiCLIPOBJ_bEnum",
    "NtGdiCLIPOBJ_cEnumStart",
    "NtGdiCLIPOBJ_ppoGetPath",
    "NtGdiCancelDC",
    "NtGdiChangeGhostFont",
    "NtGdiCheckBitmapBits",
    "NtGdiClearBitmapAttributes",
    "NtGdiClearBrushAttributes",
    "NtGdiCloseFigure",
    "NtGdiColorCorrectPalette",
    "NtGdiCombineRgn",
    "NtGdiCombineTransform",
    "NtGdiComputeXformCoefficients",
    "NtGdiConfigureOPMProtectedOutput",
    "NtGdiConvertMetafileRect",
    "NtGdiCreateBitmap",
    "NtGdiCreateBitmapFromDxSurface",
    "NtGdiCreateBitmapFromDxSurface2",
    "NtGdiCreateClientObj",
    "NtGdiCreateColorSpace",
    "NtGdiCreateColorTransform",
    "NtGdiCreateCompatibleBitmap",
    "NtGdiCreateCompatibleDC",
    "NtGdiCreateDIBBrush",
    "NtGdiCreateDIBSection",
    "NtGdiCreateDIBitmapInternal",
    "NtGdiCreateEllipticRgn",
    "NtGdiCreateHalftonePalette",
    "NtGdiCreateHatchBrushInternal",
    "NtGdiCreateMetafileDC",
    "NtGdiCreateOPMProtectedOutput",
    "NtGdiCreateOPMProtectedOutputs",
    "NtGdiCreatePaletteInternal",
    "NtGdiCreatePatternBrushInternal",
    "NtGdiCreatePen",
    "NtGdiCreateRectRgn",
    "NtGdiCreateRoundRectRgn",
    "NtGdiCreateServerMetaFile",
    "NtGdiCreateSessionMappedDIBSection",
    "NtGdiCreateSolidBrush",
    "NtGdiDDCCIGetCapabilitiesString",
    "NtGdiDDCCIGetCapabilitiesStringLength",
    "NtGdiDDCCIGetTimingReport",
    "NtGdiDDCCIGetVCPFeature",
    "NtGdiDDCCISaveCurrentSettings",
    "NtGdiDDCCISetVCPFeature",
    "NtGdiDdCreateFullscreenSprite",
    "NtGdiDdDDIAbandonSwapChain",
    "NtGdiDdDDIAcquireKeyedMutex",
    "NtGdiDdDDIAcquireKeyedMutex2",
    "NtGdiDdDDIAcquireSwapChain",
    "NtGdiDdDDIAdjustFullscreenGamma",
    "NtGdiDdDDICacheHybridQueryValue",
    "NtGdiDdDDIChangeVideoMemoryReservation",
    "NtGdiDdDDICheckExclusiveOwnership",
    "NtGdiDdDDICheckMonitorPowerState",
    "NtGdiDdDDICheckMultiPlaneOverlaySupport",
    "NtGdiDdDDICheckMultiPlaneOverlaySupport2",
    "NtGdiDdDDICheckMultiPlaneOverlaySupport3",
    "NtGdiDdDDICheckOcclusion",
    "NtGdiDdDDICheckSharedResourceAccess",
    "NtGdiDdDDICheckVidPnExclusiveOwnership",
    "NtGdiDdDDICloseAdapter",
    "NtGdiDdDDIConfigureSharedResource",
    "NtGdiDdDDICreateAllocation",
    "NtGdiDdDDICreateContext",
    "NtGdiDdDDICreateContextVirtual",
    "NtGdiDdDDICreateDCFromMemory",
    "NtGdiDdDDICreateDevice",
    "NtGdiDdDDICreateHwContext",
    "NtGdiDdDDICreateHwQueue",
    "NtGdiDdDDICreateKeyedMutex",
    "NtGdiDdDDICreateKeyedMutex2",
    "NtGdiDdDDICreateOutputDupl",
    "NtGdiDdDDICreateOverlay",
    "NtGdiDdDDICreatePagingQueue",
    "NtGdiDdDDICreateSwapChain",
    "NtGdiDdDDICreateSynchronizationObject",
    "NtGdiDdDDIDestroyAllocation",
    "NtGdiDdDDIDestroyAllocation2",
    "NtGdiDdDDIDestroyContext",
    "NtGdiDdDDIDestroyDCFromMemory",
    "NtGdiDdDDIDestroyDevice",
    "NtGdiDdDDIDestroyHwContext",
    "NtGdiDdDDIDestroyHwQueue",
    "NtGdiDdDDIDestroyKeyedMutex",
    "NtGdiDdDDIDestroyOutputDupl",
    "NtGdiDdDDIDestroyOverlay",
    "NtGdiDdDDIDestroyPagingQueue",
    "NtGdiDdDDIDestroySynchronizationObject",
    "NtGdiDdDDIEnumAdapters",
    "NtGdiDdDDIEnumAdapters2",
    "NtGdiDdDDIEscape",
    "NtGdiDdDDIEvict",
    "NtGdiDdDDIFlipOverlay",
    "NtGdiDdDDIFlushHeapTransitions",
    "NtGdiDdDDIFreeGpuVirtualAddress",
    "NtGdiDdDDIGetAllocationPriority",
    "NtGdiDdDDIGetCachedHybridQueryValue",
    "NtGdiDdDDIGetContextInProcessSchedulingPriority",
    "NtGdiDdDDIGetContextSchedulingPriority",
    "NtGdiDdDDIGetDWMVerticalBlankEvent",
    "NtGdiDdDDIGetDeviceState",
    "NtGdiDdDDIGetDisplayModeList",
    "NtGdiDdDDIGetMemoryBudgetTarget",
    "NtGdiDdDDIGetMultiPlaneOverlayCaps",
    "NtGdiDdDDIGetMultisampleMethodList",
    "NtGdiDdDDIGetOverlayState",
    "NtGdiDdDDIGetPostCompositionCaps",
    "NtGdiDdDDIGetPresentHistory",
    "NtGdiDdDDIGetPresentQueueEvent",
    "NtGdiDdDDIGetProcessSchedulingPriorityBand",
    "NtGdiDdDDIGetProcessSchedulingPriorityClass",
    "NtGdiDdDDIGetResourcePresentPrivateDriverData",
    "NtGdiDdDDIGetRuntimeData",
    "NtGdiDdDDIGetScanLine",
    "NtGdiDdDDIGetSetSwapChainMetadata",
    "NtGdiDdDDIGetSharedPrimaryHandle",
    "NtGdiDdDDIGetSharedResourceAdapterLuid",
    "NtGdiDdDDIGetYieldPercentage",
    "NtGdiDdDDIInvalidateActiveVidPn",
    "NtGdiDdDDIInvalidateCache",
    "NtGdiDdDDILock",
    "NtGdiDdDDILock2",
    "NtGdiDdDDIMakeResident",
    "NtGdiDdDDIMapGpuVirtualAddress",
    "NtGdiDdDDIMarkDeviceAsError",
    "NtGdiDdDDINetDispGetNextChunkInfo",
    "NtGdiDdDDINetDispQueryMiracastDisplayDeviceStatus",
    "NtGdiDdDDINetDispQueryMiracastDisplayDeviceSupport",
    "NtGdiDdDDINetDispStartMiracastDisplayDevice",
    "NtGdiDdDDINetDispStopMiracastDisplayDevice",
    "NtGdiDdDDINetDispStopSessions",
    "NtGdiDdDDIOfferAllocations",
    "NtGdiDdDDIOpenAdapterFromDeviceName",
    "NtGdiDdDDIOpenAdapterFromHdc",
    "NtGdiDdDDIOpenAdapterFromLuid",
    "NtGdiDdDDIOpenKeyedMutex",
    "NtGdiDdDDIOpenKeyedMutex2",
    "NtGdiDdDDIOpenNtHandleFromName",
    "NtGdiDdDDIOpenResource",
    "NtGdiDdDDIOpenResourceFromNtHandle",
    "NtGdiDdDDIOpenSwapChain",
    "NtGdiDdDDIOpenSyncObjectFromNtHandle",
    "NtGdiDdDDIOpenSyncObjectFromNtHandle2",
    "NtGdiDdDDIOpenSyncObjectNtHandleFromName",
    "NtGdiDdDDIOpenSynchronizationObject",
    "NtGdiDdDDIOutputDuplGetFrameInfo",
    "NtGdiDdDDIOutputDuplGetMetaData",
    "NtGdiDdDDIOutputDuplGetPointerShapeData",
    "NtGdiDdDDIOutputDuplPresent",
    "NtGdiDdDDIOutputDuplReleaseFrame",
    "NtGdiDdDDIPinDirectFlipResources",
    "NtGdiDdDDIPollDisplayChildren",
    "NtGdiDdDDIPresent",
    "NtGdiDdDDIPresentMultiPlaneOverlay",
    "NtGdiDdDDIPresentMultiPlaneOverlay2",
    "NtGdiDdDDIPresentMultiPlaneOverlay3",
    "NtGdiDdDDIQueryAdapterInfo",
    "NtGdiDdDDIQueryAllocationResidency",
    "NtGdiDdDDIQueryClockCalibration",
    "NtGdiDdDDIQueryFSEBlock",
    "NtGdiDdDDIQueryProcessOfferInfo",
    "NtGdiDdDDIQueryRemoteVidPnSourceFromGdiDisplayName",
    "NtGdiDdDDIQueryResourceInfo",
    "NtGdiDdDDIQueryResourceInfoFromNtHandle",
    "NtGdiDdDDIQueryStatistics",
    "NtGdiDdDDIQueryVidPnExclusiveOwnership",
    "NtGdiDdDDIQueryVideoMemoryInfo",
    "NtGdiDdDDIReclaimAllocations",
    "NtGdiDdDDIReclaimAllocations2",
    "NtGdiDdDDIReleaseKeyedMutex",
    "NtGdiDdDDIReleaseKeyedMutex2",
    "NtGdiDdDDIReleaseProcessVidPnSourceOwners",
    "NtGdiDdDDIReleaseSwapChain",
    "NtGdiDdDDIRender",
    "NtGdiDdDDIReserveGpuVirtualAddress",
    "NtGdiDdDDISetAllocationPriority",
    "NtGdiDdDDISetContextInProcessSchedulingPriority",
    "NtGdiDdDDISetContextSchedulingPriority",
    "NtGdiDdDDISetDisplayMode",
    "NtGdiDdDDISetDisplayPrivateDriverFormat",
    "NtGdiDdDDISetDodIndirectSwapchain",
    "NtGdiDdDDISetFSEBlock",
    "NtGdiDdDDISetGammaRamp",
    "NtGdiDdDDISetHwProtectionTeardownRecovery",
    "NtGdiDdDDISetMemoryBudgetTarget",
    "NtGdiDdDDISetProcessSchedulingPriorityBand",
    "NtGdiDdDDISetProcessSchedulingPriorityClass",
    "NtGdiDdDDISetQueuedLimit",
    "NtGdiDdDDISetStablePowerState",
    "NtGdiDdDDISetStereoEnabled",
    "NtGdiDdDDISetSyncRefreshCountWaitTarget",
    "NtGdiDdDDISetVidPnSourceHwProtection",
    "NtGdiDdDDISetVidPnSourceOwner",
    "NtGdiDdDDISetVidPnSourceOwner1",
    "NtGdiDdDDISetYieldPercentage",
    "NtGdiDdDDIShareObjects",
    "NtGdiDdDDISharedPrimaryLockNotification",
    "NtGdiDdDDISharedPrimaryUnLockNotification",
    "NtGdiDdDDISignalSynchronizationObject",
    "NtGdiDdDDISignalSynchronizationObjectFromCpu",
    "NtGdiDdDDISignalSynchronizationObjectFromGpu",
    "NtGdiDdDDISignalSynchronizationObjectFromGpu2",
    "NtGdiDdDDISubmitCommand",
    "NtGdiDdDDISubmitCommandToHwQueue",
    "NtGdiDdDDISubmitSignalSyncObjectsToHwQueue",
    "NtGdiDdDDISubmitWaitForSyncObjectsToHwQueue",
    "NtGdiDdDDITrimProcessCommitment",
    "NtGdiDdDDIUnlock",
    "NtGdiDdDDIUnlock2",
    "NtGdiDdDDIUnpinDirectFlipResources",
    "NtGdiDdDDIUpdateAllocationProperty",
    "NtGdiDdDDIUpdateGpuVirtualAddress",
    "NtGdiDdDDIUpdateOverlay",
    "NtGdiDdDDIWaitForIdle",
    "NtGdiDdDDIWaitForSynchronizationObject",
    "NtGdiDdDDIWaitForSynchronizationObjectFromCpu",
    "NtGdiDdDDIWaitForSynchronizationObjectFromGpu",
    "NtGdiDdDDIWaitForVerticalBlankEvent",
    "NtGdiDdDDIWaitForVerticalBlankEvent2",
    "NtGdiDdDestroyFullscreenSprite",
    "NtGdiDdNotifyFullscreenSpriteUpdate",
    "NtGdiDdQueryVisRgnUniqueness",
    "NtGdiDeleteClientObj",
    "NtGdiDeleteColorSpace",
    "NtGdiDeleteColorTransform",
    "NtGdiDeleteObjectApp",
    "NtGdiDescribePixelFormat",
    "NtGdiDestroyOPMProtectedOutput",
    "NtGdiDestroyPhysicalMonitor",
    "NtGdiDoBanding",
    "NtGdiDoPalette",
    "NtGdiDrawEscape",
    "NtGdiDrawStream",
    "NtGdiDwmCreatedBitmapRemotingOutput",
    "NtGdiEllipse",
    "NtGdiEnableEudc",
    "NtGdiEndDoc",
    "NtGdiEndGdiRendering",
    "NtGdiEndPage",
    "NtGdiEndPath",
    "NtGdiEngAlphaBlend",
    "NtGdiEngAssociateSurface",
    "NtGdiEngBitBlt",
    "NtGdiEngCheckAbort",
    "NtGdiEngComputeGlyphSet",
    "NtGdiEngCopyBits",
    "NtGdiEngCreateBitmap",
    "NtGdiEngCreateClip",
    "NtGdiEngCreateDeviceBitmap",
    "NtGdiEngCreateDeviceSurface",
    "NtGdiEngCreatePalette",
    "NtGdiEngDeleteClip",
    "NtGdiEngDeletePalette",
    "NtGdiEngDeletePath",
    "NtGdiEngDeleteSurface",
    "NtGdiEngEraseSurface",
    "NtGdiEngFillPath",
    "NtGdiEngGradientFill",
    "NtGdiEngLineTo",
    "NtGdiEngLockSurface",
    "NtGdiEngMarkBandingSurface",
    "NtGdiEngPaint",
    "NtGdiEngPlgBlt",
    "NtGdiEngStretchBlt",
    "NtGdiEngStretchBltROP",
    "NtGdiEngStrokeAndFillPath",
    "NtGdiEngStrokePath",
    "NtGdiEngTextOut",
    "NtGdiEngTransparentBlt",
    "NtGdiEngUnlockSurface",
    "NtGdiEnumFonts",
    "NtGdiEnumObjects",
    "NtGdiEqualRgn",
    "NtGdiEudcLoadUnloadLink",
    "NtGdiExcludeClipRect",
    "NtGdiExtCreatePen",
    "NtGdiExtCreateRegion",
    "NtGdiExtEscape",
    "NtGdiExtFloodFill",
    "NtGdiExtGetObjectW",
    "NtGdiExtSelectClipRgn",
    "NtGdiExtTextOutW",
    "NtGdiFONTOBJ_cGetAllGlyphHandles",
    "NtGdiFONTOBJ_cGetGlyphs",
    "NtGdiFONTOBJ_pQueryGlyphAttrs",
    "NtGdiFONTOBJ_pfdg",
    "NtGdiFONTOBJ_pifi",
    "NtGdiFONTOBJ_pvTrueTypeFontFile",
    "NtGdiFONTOBJ_pxoGetXform",
    "NtGdiFONTOBJ_vGetInfo",
    "NtGdiFillPath",
    "NtGdiFillRgn",
    "NtGdiFlattenPath",
    "NtGdiFlush",
    "NtGdiFontIsLinked",
    "NtGdiForceUFIMapping",
    "NtGdiFrameRgn",
    "NtGdiFullscreenControl",
    "NtGdiGetAndSetDCDword",
    "NtGdiGetAppClipBox",
    "NtGdiGetAppliedDeviceGammaRamp",
    "NtGdiGetBitmapBits",
    "NtGdiGetBitmapDimension",
    "NtGdiGetBitmapDpiScaleValue",
    "NtGdiGetBoundsRect",
    "NtGdiGetCOPPCompatibleOPMInformation",
    "NtGdiGetCertificate",
    "NtGdiGetCertificateByHandle",
    "NtGdiGetCertificateSize",
    "NtGdiGetCertificateSizeByHandle",
    "NtGdiGetCharABCWidthsW",
    "NtGdiGetCharSet",
    "NtGdiGetCharWidthInfo",
    "NtGdiGetCharWidthW",
    "NtGdiGetCharacterPlacementW",
    "NtGdiGetColorAdjustment",
    "NtGdiGetColorSpaceforBitmap",
    "NtGdiGetCurrentDpiInfo",
    "NtGdiGetDCDpiScaleValue",
    "NtGdiGetDCDword",
    "NtGdiGetDCObject",
    "NtGdiGetDCPoint",
    "NtGdiGetDCforBitmap",
    "NtGdiGetDIBitsInternal",
    "NtGdiGetDeviceCaps",
    "NtGdiGetDeviceCapsAll",
    "NtGdiGetDeviceGammaRamp",
    "NtGdiGetDeviceWidth",
    "NtGdiGetDhpdev",
    "NtGdiGetETM",
    "NtGdiGetEmbUFI",
    "NtGdiGetEmbedFonts",
    "NtGdiGetEntry",
    "NtGdiGetEudcTimeStampEx",
    "NtGdiGetFontData",
    "NtGdiGetFontFileData",
    "NtGdiGetFontFileInfo",
    "NtGdiGetFontResourceInfoInternalW",
    "NtGdiGetFontUnicodeRanges",
    "NtGdiGetGammaRampCapability",
    "NtGdiGetGlyphIndicesW",
    "NtGdiGetGlyphIndicesWInternal",
    "NtGdiGetGlyphOutline",
    "NtGdiGetKerningPairs",
    "NtGdiGetLinkedUFIs",
    "NtGdiGetMiterLimit",
    "NtGdiGetMonitorID",
    "NtGdiGetNearestColor",
    "NtGdiGetNearestPaletteIndex",
    "NtGdiGetNumberOfPhysicalMonitors",
    "NtGdiGetOPMInformation",
    "NtGdiGetOPMRandomNumber",
    "NtGdiGetObjectBitmapHandle",
    "NtGdiGetOutlineTextMetricsInternalW",
    "NtGdiGetPath",
    "NtGdiGetPerBandInfo",
    "NtGdiGetPhysicalMonitorDescription",
    "NtGdiGetPhysicalMonitors",
    "NtGdiGetPixel",
    "NtGdiGetProcessSessionFonts",
    "NtGdiGetPublicFontTableChangeCookie",
    "NtGdiGetRandomRgn",
    "NtGdiGetRasterizerCaps",
    "NtGdiGetRealizationInfo",
    "NtGdiGetRegionData",
    "NtGdiGetRgnBox",
    "NtGdiGetServerMetaFileBits",
    "NtGdiGetSpoolMessage",
    "NtGdiGetStats",
    "NtGdiGetStringBitmapW",
    "NtGdiGetSuggestedOPMProtectedOutputArraySize",
    "NtGdiGetSystemPaletteUse",
    "NtGdiGetTextCharsetInfo",
    "NtGdiGetTextExtent",
    "NtGdiGetTextExtentExW",
    "NtGdiGetTextFaceW",
    "NtGdiGetTextMetricsW",
    "NtGdiGetTransform",
    "NtGdiGetUFI",
    "NtGdiGetUFIPathname",
    "NtGdiGetWidthTable",
    "NtGdiGradientFill",
    "NtGdiHLSurfGetInformation",
    "NtGdiHLSurfSetInformation",
    "NtGdiHT_Get8BPPFormatPalette",
    "NtGdiHT_Get8BPPMaskPalette",
    "NtGdiHfontCreate",
    "NtGdiIcmBrushInfo",
    "NtGdiInit",
    "NtGdiInitSpool",
    "NtGdiIntersectClipRect",
    "NtGdiInvertRgn",
    "NtGdiLineTo",
    "NtGdiMakeFontDir",
    "NtGdiMakeInfoDC",
    "NtGdiMakeObjectUnXferable",
    "NtGdiMakeObjectXferable",
    "NtGdiMaskBlt",
    "NtGdiMirrorWindowOrg",
    "NtGdiModifyWorldTransform",
    "NtGdiMonoBitmap",
    "NtGdiMoveTo",
    "NtGdiOffsetClipRgn",
    "NtGdiOffsetRgn",
    "NtGdiOpenDCW",
    "NtGdiPATHOBJ_bEnum",
    "NtGdiPATHOBJ_bEnumClipLines",
    "NtGdiPATHOBJ_vEnumStart",
    "NtGdiPATHOBJ_vEnumStartClipLines",
    "NtGdiPATHOBJ_vGetBounds",
    "NtGdiPatBlt",
    "NtGdiPathToRegion",
    "NtGdiPlgBlt",
    "NtGdiPolyDraw",
    "NtGdiPolyPatBlt",
    "NtGdiPolyPolyDraw",
    "NtGdiPolyTextOutW",
    "NtGdiPtInRegion",
    "NtGdiPtVisible",
    "NtGdiQueryFontAssocInfo",
    "NtGdiQueryFonts",
    "NtGdiRectInRegion",
    "NtGdiRectVisible",
    "NtGdiRectangle",
    "NtGdiRemoveFontMemResourceEx",
    "NtGdiRemoveFontResourceW",
    "NtGdiRemoveMergeFont",
    "NtGdiResetDC",
    "NtGdiResizePalette",
    "NtGdiRestoreDC",
    "NtGdiRoundRect",
    "NtGdiSTROBJ_bEnum",
    "NtGdiSTROBJ_bEnumPositionsOnly",
    "NtGdiSTROBJ_bGetAdvanceWidths",
    "NtGdiSTROBJ_dwGetCodePage",
    "NtGdiSTROBJ_vEnumStart",
    "NtGdiSaveDC",
    "NtGdiScaleRgn",
    "NtGdiScaleValues",
    "NtGdiScaleViewportExtEx",
    "NtGdiScaleWindowExtEx",
    "NtGdiSelectBitmap",
    "NtGdiSelectBrush",
    "NtGdiSelectClipPath",
    "NtGdiSelectFont",
    "NtGdiSelectPen",
    "NtGdiSetBitmapAttributes",
    "NtGdiSetBitmapBits",
    "NtGdiSetBitmapDimension",
    "NtGdiSetBoundsRect",
    "NtGdiSetBrushAttributes",
    "NtGdiSetBrushOrg",
    "NtGdiSetColorAdjustment",
    "NtGdiSetColorSpace",
    "NtGdiSetDIBitsToDeviceInternal",
    "NtGdiSetDeviceGammaRamp",
    "NtGdiSetFontEnumeration",
    "NtGdiSetFontXform",
    "NtGdiSetIcmMode",
    "NtGdiSetLayout",
    "NtGdiSetLinkedUFIs",
    "NtGdiSetMagicColors",
    "NtGdiSetMetaRgn",
    "NtGdiSetMiterLimit",
    "NtGdiSetOPMSigningKeyAndSequenceNumbers",
    "NtGdiSetPUMPDOBJ",
    "NtGdiSetPixel",
    "NtGdiSetPixelFormat",
    "NtGdiSetPrivateDeviceGammaRamp",
    "NtGdiSetRectRgn",
    "NtGdiSetSizeDevice",
    "NtGdiSetSystemPaletteUse",
    "NtGdiSetTextJustification",
    "NtGdiSetUMPDSandboxState",
    "NtGdiSetVirtualResolution",
    "NtGdiStartDoc",
    "NtGdiStartPage",
    "NtGdiStretchBlt",
    "NtGdiStretchDIBitsInternal",
    "NtGdiStrokeAndFillPath",
    "NtGdiStrokePath",
    "NtGdiSwapBuffers",
    "NtGdiTransformPoints",
    "NtGdiTransparentBlt",
    "NtGdiUMPDEngFreeUserMem",
    "NtGdiUnloadPrinterDriver",
    "NtGdiUnmapMemFont",
    "NtGdiUnrealizeObject",
    "NtGdiUpdateColors",
    "NtGdiUpdateTransform",
    "NtGdiWidenPath",
    "NtGdiXFORMOBJ_bApplyXform",
    "NtGdiXFORMOBJ_iGetXform",
    "NtGdiXLATEOBJ_cGetPalette",
    "NtGdiXLATEOBJ_hGetColorTransform",
    "NtGdiXLATEOBJ_iXlate",
    "NtHWCursorUpdatePointer",
    "NtMITActivateInputProcessing",
    "NtMITBindInputTypeToMonitors",
    "NtMITCoreMsgKGetConnectionHandle",
    "NtMITCoreMsgKOpenConnectionTo",
    "NtMITCoreMsgKSend",
    "NtMITDeactivateInputProcessing",
    "NtMITDisableMouseIntercept",
    "NtMITEnableMouseIntercept",
    "NtMITSetInputCallbacks",
    "NtMITSynthesizeMouseInput",
    "NtMITSynthesizeMouseWheel",
    "NtMITSynthesizeTouchInput",
    "NtMITUpdateInputGlobals",
    "NtMITWaitForMultipleObjectsEx",
    "NtNotifyPresentToCompositionSurface",
    "NtOpenCompositionSurfaceDirtyRegion",
    "NtOpenCompositionSurfaceSectionInfo",
    "NtOpenCompositionSurfaceSwapChainHandleInfo",
    "NtQueryCompositionInputIsImplicit",
    "NtQueryCompositionInputQueueAndTransform",
    "NtQueryCompositionInputSink",
    "NtQueryCompositionInputSinkLuid",
    "NtQueryCompositionInputSinkViewId",
    "NtQueryCompositionSurfaceBinding",
    "NtQueryCompositionSurfaceHDRMetaData",
    "NtQueryCompositionSurfaceRenderingRealization",
    "NtQueryCompositionSurfaceStatistics",
    "NtRIMAddInputObserver",
    "NtRIMAreSiblingDevices",
    "NtRIMDeviceIoControl",
    "NtRIMFreeInputBuffer",
    "NtRIMGetDevicePreparsedData",
    "NtRIMGetDevicePreparsedDataLockfree",
    "NtRIMGetDeviceProperties",
    "NtRIMGetDevicePropertiesLockfree",
    "NtRIMGetPhysicalDeviceRect",
    "NtRIMGetSourceProcessId",
    "NtRIMObserveNextInput",
    "NtRIMOnPnpNotification",
    "NtRIMOnTimerNotification",
    "NtRIMReadInput",
    "NtRIMRegisterForInput",
    "NtRIMRemoveInputObserver",
    "NtRIMSetTestModeStatus",
    "NtRIMUnregisterForInput",
    "NtRIMUpdateInputObserverRegistration",
    "NtSetCompositionSurfaceAnalogExclusive",
    "NtSetCompositionSurfaceBufferUsage",
    "NtSetCompositionSurfaceDirectFlipState",
    "NtSetCompositionSurfaceHDRMetaData",
    "NtSetCompositionSurfaceIndependentFlipInfo",
    "NtSetCompositionSurfaceStatistics",
    "NtTokenManagerConfirmOutstandingAnalogToken",
    "NtTokenManagerCreateCompositionTokenHandle",
    "NtTokenManagerGetAnalogExclusiveSurfaceUpdates",
    "NtTokenManagerGetAnalogExclusiveTokenEvent",
    "NtTokenManagerOpenSectionAndEvents",
    "NtTokenManagerThread",
    "NtUnBindCompositionSurface",
    "NtUpdateInputSinkTransforms",
    "NtUserAcquireIAMKey",
    "NtUserAcquireInteractiveControlBackgroundAccess",
    "NtUserActivateKeyboardLayout",
    "NtUserAddClipboardFormatListener",
    "NtUserAlterWindowStyle",
    "NtUserAssociateInputContext",
    "NtUserAttachThreadInput",
    "NtUserAutoPromoteMouseInPointer",
    "NtUserAutoRotateScreen",
    "NtUserBeginLayoutUpdate",
    "NtUserBeginPaint",
    "NtUserBitBltSysBmp",
    "NtUserBlockInput",
    "NtUserBroadcastThemeChangeEvent",
    "NtUserBuildHimcList",
    "NtUserBuildHwndList",
    "NtUserBuildNameList",
    "NtUserBuildPropList",
    "NtUserCalcMenuBar",
    "NtUserCalculatePopupWindowPosition",
    "NtUserCallHwnd",
    "NtUserCallHwndLock",
    "NtUserCallHwndOpt",
    "NtUserCallHwndParam",
    "NtUserCallHwndParamLock",
    "NtUserCallMsgFilter",
    "NtUserCallNextHookEx",
    "NtUserCallNoParam",
    "NtUserCallOneParam",
    "NtUserCallTwoParam",
    "NtUserCanBrokerForceForeground",
    "NtUserChangeClipboardChain",
    "NtUserChangeDisplaySettings",
    "NtUserChangeWindowMessageFilterEx",
    "NtUserCheckAccessForIntegrityLevel",
    "NtUserCheckMenuItem",
    "NtUserCheckProcessForClipboardAccess",
    "NtUserCheckProcessSession",
    "NtUserCheckWindowThreadDesktop",
    "NtUserChildWindowFromPointEx",
    "NtUserClearForeground",
    "NtUserClipCursor",
    "NtUserCloseClipboard",
    "NtUserCloseDesktop",
    "NtUserCloseWindowStation",
    "NtUserCompositionInputSinkLuidFromPoint",
    "NtUserCompositionInputSinkViewInstanceIdFromPoint",
    "NtUserConfirmResizeCommit",
    "NtUserConsoleControl",
    "NtUserConvertMemHandle",
    "NtUserCopyAcceleratorTable",
    "NtUserCountClipboardFormats",
    "NtUserCreateAcceleratorTable",
    "NtUserCreateCaret",
    "NtUserCreateDCompositionHwndTarget",
    "NtUserCreateDesktopEx",
    "NtUserCreateInputContext",
    "NtUserCreateLocalMemHandle",
    "NtUserCreateWindowEx",
    "NtUserCreateWindowStation",
    "NtUserCtxDisplayIOCtl",
    "NtUserDdeInitialize",
    "NtUserDefSetText",
    "NtUserDeferWindowPosAndBand",
    "NtUserDelegateCapturePointers",
    "NtUserDelegateInput",
    "NtUserDeleteMenu",
    "NtUserDestroyAcceleratorTable",
    "NtUserDestroyCursor",
    "NtUserDestroyDCompositionHwndTarget",
    "NtUserDestroyInputContext",
    "NtUserDestroyMenu",
    "NtUserDestroyWindow",
    "NtUserDisableImmersiveOwner",
    "NtUserDisableProcessWindowFiltering",
    "NtUserDisableThreadIme",
    "NtUserDiscardPointerFrameMessages",
    "NtUserDispatchMessage",
    "NtUserDisplayConfigGetDeviceInfo",
    "NtUserDisplayConfigSetDeviceInfo",
    "NtUserDoSoundConnect",
    "NtUserDoSoundDisconnect",
    "NtUserDragDetect",
    "NtUserDragObject",
    "NtUserDrawAnimatedRects",
    "NtUserDrawCaption",
    "NtUserDrawCaptionTemp",
    "NtUserDrawIconEx",
    "NtUserDrawMenuBarTemp",
    "NtUserDwmGetRemoteSessionOcclusionEvent",
    "NtUserDwmGetRemoteSessionOcclusionState",
    "NtUserDwmKernelShutdown",
    "NtUserDwmKernelStartup",
    "NtUserDwmValidateWindow",
    "NtUserEmptyClipboard",
    "NtUserEnableChildWindowDpiMessage",
    "NtUserEnableIAMAccess",
    "NtUserEnableMenuItem",
    "NtUserEnableMouseInPointer",
    "NtUserEnableMouseInputForCursorSuppression",
    "NtUserEnableNonClientDpiScaling",
    "NtUserEnableResizeLayoutSynchronization",
    "NtUserEnableScrollBar",
    "NtUserEnableTouchPad",
    "NtUserEnableWindowGDIScaledDpiMessage",
    "NtUserEnableWindowResizeOptimization",
    "NtUserEndDeferWindowPosEx",
    "NtUserEndMenu",
    "NtUserEndPaint",
    "NtUserEnumDisplayDevices",
    "NtUserEnumDisplayMonitors",
    "NtUserEnumDisplaySettings",
    "NtUserEvent",
    "NtUserExcludeUpdateRgn",
    "NtUserFillWindow",
    "NtUserFindExistingCursorIcon",
    "NtUserFindWindowEx",
    "NtUserFlashWindowEx",
    "NtUserFrostCrashedWindow",
    "NtUserFunctionalizeDisplayConfig",
    "NtUserGetAltTabInfo",
    "NtUserGetAncestor",
    "NtUserGetAppImeLevel",
    "NtUserGetAsyncKeyState",
    "NtUserGetAtomName",
    "NtUserGetAutoRotationState",
    "NtUserGetCIMSSM",
    "NtUserGetCPD",
    "NtUserGetCaretBlinkTime",
    "NtUserGetCaretPos",
    "NtUserGetClassInfoEx",
    "NtUserGetClassName",
    "NtUserGetClipCursor",
    "NtUserGetClipboardAccessToken",
    "NtUserGetClipboardData",
    "NtUserGetClipboardFormatName",
    "NtUserGetClipboardOwner",
    "NtUserGetClipboardSequenceNumber",
    "NtUserGetClipboardViewer",
    "NtUserGetComboBoxInfo",
    "NtUserGetControlBrush",
    "NtUserGetControlColor",
    "NtUserGetCurrentInputMessageSource",
    "NtUserGetCursorDims",
    "NtUserGetCursorFrameInfo",
    "NtUserGetCursorInfo",
    "NtUserGetDC",
    "NtUserGetDCEx",
    "NtUserGetDManipHookInitFunction",
    "NtUserGetDesktopID",
    "NtUserGetDisplayAutoRotationPreferences",
    "NtUserGetDisplayAutoRotationPreferencesByProcessId",
    "NtUserGetDisplayConfigBufferSizes",
    "NtUserGetDoubleClickTime",
    "NtUserGetDpiForMonitor",
    "NtUserGetForegroundWindow",
    "NtUserGetGUIThreadInfo",
    "NtUserGetGestureConfig",
    "NtUserGetGestureExtArgs",
    "NtUserGetGestureInfo",
    "NtUserGetGuiResources",
    "NtUserGetHimetricScaleFactorFromPixelLocation",
    "NtUserGetIconInfo",
    "NtUserGetIconSize",
    "NtUserGetImeHotKey",
    "NtUserGetImeInfoEx",
    "NtUserGetInputLocaleInfo",
    "NtUserGetInteractiveControlDeviceInfo",
    "NtUserGetInteractiveControlInfo",
    "NtUserGetInteractiveCtrlSupportedWaveforms",
    "NtUserGetInternalWindowPos",
    "NtUserGetKeyNameText",
    "NtUserGetKeyState",
    "NtUserGetKeyboardLayoutList",
    "NtUserGetKeyboardLayoutName",
    "NtUserGetKeyboardState",
    "NtUserGetLayeredWindowAttributes",
    "NtUserGetListBoxInfo",
    "NtUserGetMenuBarInfo",
    "NtUserGetMenuIndex",
    "NtUserGetMenuItemRect",
    "NtUserGetMessage",
    "NtUserGetMouseMovePointsEx",
    "NtUserGetObjectInformation",
    "NtUserGetOpenClipboardWindow",
    "NtUserGetOwnerTransformedMonitorRect",
    "NtUserGetPhysicalDeviceRect",
    "NtUserGetPointerCursorId",
    "NtUserGetPointerDevice",
    "NtUserGetPointerDeviceCursors",
    "NtUserGetPointerDeviceProperties",
    "NtUserGetPointerDeviceRects",
    "NtUserGetPointerDevices",
    "NtUserGetPointerFrameArrivalTimes",
    "NtUserGetPointerInfoList",
    "NtUserGetPointerInputTransform",
    "NtUserGetPointerType",
    "NtUserGetPrecisionTouchPadConfiguration",
    "NtUserGetPriorityClipboardFormat",
    "NtUserGetProcessDpiAwarenessContext",
    "NtUserGetProcessUIContextInformation",
    "NtUserGetProcessWindowStation",
    "NtUserGetProp",
    "NtUserGetQueueStatusReadonly",
    "NtUserGetRawInputBuffer",
    "NtUserGetRawInputData",
    "NtUserGetRawInputDeviceInfo",
    "NtUserGetRawInputDeviceList",
    "NtUserGetRawPointerDeviceData",
    "NtUserGetRegisteredRawInputDevices",
    "NtUserGetResizeDCompositionSynchronizationObject",
    "NtUserGetScrollBarInfo",
    "NtUserGetSystemMenu",
    "NtUserGetThreadDesktop",
    "NtUserGetThreadState",
    "NtUserGetTitleBarInfo",
    "NtUserGetTopLevelWindow",
    "NtUserGetTouchInputInfo",
    "NtUserGetTouchValidationStatus",
    "NtUserGetUpdateRect",
    "NtUserGetUpdateRgn",
    "NtUserGetUpdatedClipboardFormats",
    "NtUserGetWOWClass",
    "NtUserGetWindowBand",
    "NtUserGetWindowCompositionAttribute",
    "NtUserGetWindowCompositionInfo",
    "NtUserGetWindowDC",
    "NtUserGetWindowDisplayAffinity",
    "NtUserGetWindowFeedbackSetting",
    "NtUserGetWindowMinimizeRect",
    "NtUserGetWindowPlacement",
    "NtUserGetWindowRgnEx",
    "NtUserGhostWindowFromHungWindow",
    "NtUserHandleDelegatedInput",
    "NtUserHardErrorControl",
    "NtUserHideCaret",
    "NtUserHidePointerContactVisualization",
    "NtUserHiliteMenuItem",
    "NtUserHungWindowFromGhostWindow",
    "NtUserHwndQueryRedirectionInfo",
    "NtUserHwndSetRedirectionInfo",
    "NtUserImpersonateDdeClientWindow",
    "NtUserInheritWindowMonitor",
    "NtUserInitTask",
    "NtUserInitialize",
    "NtUserInitializeClientPfnArrays",
    "NtUserInitializeGenericHidInjection",
    "NtUserInitializeInputDeviceInjection",
    "NtUserInitializePointerDeviceInjection",
    "NtUserInitializePointerDeviceInjectionEx",
    "NtUserInitializeTouchInjection",
    "NtUserInjectDeviceInput",
    "NtUserInjectGenericHidInput",
    "NtUserInjectGesture",
    "NtUserInjectKeyboardInput",
    "NtUserInjectMouseInput",
    "NtUserInjectPointerInput",
    "NtUserInjectTouchInput",
    "NtUserInteractiveControlQueryUsage",
    "NtUserInternalGetWindowIcon",
    "NtUserInternalGetWindowText",
    "NtUserInvalidateRect",
    "NtUserInvalidateRgn",
    "NtUserIsChildWindowDpiMessageEnabled",
    "NtUserIsClipboardFormatAvailable",
    "NtUserIsMouseInPointerEnabled",
    "NtUserIsMouseInputEnabled",
    "NtUserIsNonClientDpiScalingEnabled",
    "NtUserIsResizeLayoutSynchronizationEnabled",
    "NtUserIsTopLevelWindow",
    "NtUserIsTouchWindow",
    "NtUserIsWindowBroadcastingDpiToChildren",
    "NtUserIsWindowGDIScaledDpiMessageEnabled",
    "NtUserKillTimer",
    "NtUserLayoutCompleted",
    "NtUserLinkDpiCursor",
    "NtUserLoadKeyboardLayoutEx",
    "NtUserLockCursor",
    "NtUserLockWindowStation",
    "NtUserLockWindowUpdate",
    "NtUserLockWorkStation",
    "NtUserLogicalToPerMonitorDPIPhysicalPoint",
    "NtUserLogicalToPhysicalPoint",
    "NtUserMNDragLeave",
    "NtUserMNDragOver",
    "NtUserMagControl",
    "NtUserMagGetContextInformation",
    "NtUserMagSetContextInformation",
    "NtUserMapVirtualKeyEx",
    "NtUserMenuItemFromPoint",
    "NtUserMessageCall",
    "NtUserMinMaximize",
    "NtUserModifyUserStartupInfoFlags",
    "NtUserModifyWindowTouchCapability",
    "NtUserMoveWindow",
    "NtUserNavigateFocus",
    "NtUserNotifyIMEStatus",
    "NtUserNotifyProcessCreate",
    "NtUserNotifyWinEvent",
    "NtUserOpenClipboard",
    "NtUserOpenDesktop",
    "NtUserOpenInputDesktop",
    "NtUserOpenThreadDesktop",
    "NtUserOpenWindowStation",
    "NtUserPaintDesktop",
    "NtUserPaintMenuBar",
    "NtUserPaintMonitor",
    "NtUserPeekMessage",
    "NtUserPerMonitorDPIPhysicalToLogicalPoint",
    "NtUserPhysicalToLogicalPoint",
    "NtUserPostMessage",
    "NtUserPostThreadMessage",
    "NtUserPrintWindow",
    "NtUserProcessConnect",
    "NtUserProcessInkFeedbackCommand",
    "NtUserPromoteMouseInPointer",
    "NtUserPromotePointer",
    "NtUserQueryBSDRWindow",
    "NtUserQueryDisplayConfig",
    "NtUserQueryInformationThread",
    "NtUserQueryInputContext",
    "NtUserQuerySendMessage",
    "NtUserQueryWindow",
    "NtUserRealChildWindowFromPoint",
    "NtUserRealInternalGetMessage",
    "NtUserRealWaitMessageEx",
    "NtUserRedrawWindow",
    "NtUserRegisterBSDRWindow",
    "NtUserRegisterClassExWOW",
    "NtUserRegisterDManipHook",
    "NtUserRegisterEdgy",
    "NtUserRegisterErrorReportingDialog",
    "NtUserRegisterHotKey",
    "NtUserRegisterManipulationThread",
    "NtUserRegisterPointerDeviceNotifications",
    "NtUserRegisterPointerInputTarget",
    "NtUserRegisterRawInputDevices",
    "NtUserRegisterServicesProcess",
    "NtUserRegisterSessionPort",
    "NtUserRegisterShellPTPListener",
    "NtUserRegisterTasklist",
    "NtUserRegisterTouchHitTestingWindow",
    "NtUserRegisterTouchPadCapable",
    "NtUserRegisterUserApiHook",
    "NtUserRegisterWindowMessage",
    "NtUserReleaseDwmHitTestWaiters",
    "NtUserRemoteConnect",
    "NtUserRemoteRedrawRectangle",
    "NtUserRemoteRedrawScreen",
    "NtUserRemoteStopScreenUpdates",
    "NtUserRemoveClipboardFormatListener",
    "NtUserRemoveInjectionDevice",
    "NtUserRemoveMenu",
    "NtUserRemoveProp",
    "NtUserReportInertia",
    "NtUserResolveDesktopForWOW",
    "NtUserSBGetParms",
    "NtUserScrollDC",
    "NtUserScrollWindowEx",
    "NtUserSelectPalette",
    "NtUserSendEventMessage",
    "NtUserSendInput",
    "NtUserSendInteractiveControlHapticsReport",
    "NtUserSetActivationFilter",
    "NtUserSetActiveProcessForMonitor",
    "NtUserSetActiveWindow",
    "NtUserSetAppImeLevel",
    "NtUserSetAutoRotation",
    "NtUserSetBrokeredForeground",
    "NtUserSetCalibrationData",
    "NtUserSetCapture",
    "NtUserSetChildWindowNoActivate",
    "NtUserSetClassLong",
    // TODO: Seems to cause an error when this is included.
    // "NtUserSetClassLongPtr",
    "NtUserSetClassWord",
    "NtUserSetClipboardData",
    "NtUserSetClipboardViewer",
    "NtUserSetCoreWindow",
    "NtUserSetCoreWindowPartner",
    "NtUserSetCursor",
    "NtUserSetCursorContents",
    "NtUserSetCursorIconData",
    "NtUserSetDialogControlDpiChangeBehavior",
    "NtUserSetDisplayAutoRotationPreferences",
    "NtUserSetDisplayConfig",
    "NtUserSetDisplayMapping",
    "NtUserSetFallbackForeground",
    "NtUserSetFeatureReportResponse",
    "NtUserSetFocus",
    "NtUserSetGestureConfig",
    "NtUserSetImeHotKey",
    "NtUserSetImeInfoEx",
    "NtUserSetImeOwnerWindow",
    "NtUserSetInformationThread",
    "NtUserSetInteractiveControlFocus",
    "NtUserSetInteractiveCtrlRotationAngle",
    "NtUserSetInternalWindowPos",
    "NtUserSetKeyboardState",
    "NtUserSetLayeredWindowAttributes",
    "NtUserSetManipulationInputTarget",
    "NtUserSetMenu",
    "NtUserSetMenuContextHelpId",
    "NtUserSetMenuDefaultItem",
    "NtUserSetMenuFlagRtoL",
    "NtUserSetMirrorRendering",
    "NtUserSetObjectInformation",
    "NtUserSetParent",
    "NtUserSetPrecisionTouchPadConfiguration",
    "NtUserSetProcessDpiAwarenessContext",
    "NtUserSetProcessInteractionFlags",
    "NtUserSetProcessRestrictionExemption",
    "NtUserSetProcessUIAccessZorder",
    "NtUserSetProcessWindowStation",
    "NtUserSetProp",
    "NtUserSetScrollInfo",
    "NtUserSetSensorPresence",
    "NtUserSetShellWindowEx",
    "NtUserSetSysColors",
    "NtUserSetSystemCursor",
    "NtUserSetSystemMenu",
    "NtUserSetSystemTimer",
    "NtUserSetThreadDesktop",
    "NtUserSetThreadInputBlocked",
    "NtUserSetThreadLayoutHandles",
    "NtUserSetThreadState",
    "NtUserSetTimer",
    "NtUserSetWinEventHook",
    "NtUserSetWindowArrangement",
    "NtUserSetWindowBand",
    "NtUserSetWindowCompositionAttribute",
    "NtUserSetWindowCompositionTransition",
    "NtUserSetWindowDisplayAffinity",
    "NtUserSetWindowFNID",
    "NtUserSetWindowFeedbackSetting",
    "NtUserSetWindowLong",
    // TODO: Seems to cause an error when this is included.
    // "NtUserSetWindowLongPtr",
    "NtUserSetWindowPlacement",
    "NtUserSetWindowPos",
    "NtUserSetWindowRgn",
    "NtUserSetWindowRgnEx",
    "NtUserSetWindowShowState",
    "NtUserSetWindowStationUser",
    "NtUserSetWindowWord",
    "NtUserSetWindowsHookAW",
    "NtUserSetWindowsHookEx",
    "NtUserShowCaret",
    "NtUserShowScrollBar",
    "NtUserShowSystemCursor",
    "NtUserShowWindow",
    "NtUserShowWindowAsync",
    "NtUserShutdownBlockReasonCreate",
    "NtUserShutdownBlockReasonQuery",
    "NtUserShutdownReasonDestroy",
    "NtUserSignalRedirectionStartComplete",
    "NtUserSlicerControl",
    "NtUserSoundSentry",
    "NtUserSwitchDesktop",
    "NtUserSystemParametersInfo",
    "NtUserSystemParametersInfoForDpi",
    "NtUserTestForInteractiveUser",
    "NtUserThunkedMenuInfo",
    "NtUserThunkedMenuItemInfo",
    "NtUserToUnicodeEx",
    "NtUserTrackMouseEvent",
    "NtUserTrackPopupMenuEx",
    "NtUserTransformPoint",
    "NtUserTransformRect",
    "NtUserTranslateAccelerator",
    "NtUserTranslateMessage",
    "NtUserUndelegateInput",
    "NtUserUnhookWinEvent",
    "NtUserUnhookWindowsHookEx",
    "NtUserUnloadKeyboardLayout",
    "NtUserUnlockWindowStation",
    "NtUserUnregisterClass",
    "NtUserUnregisterHotKey",
    "NtUserUnregisterSessionPort",
    "NtUserUnregisterUserApiHook",
    "NtUserUpdateDefaultDesktopThumbnail",
    "NtUserUpdateInputContext",
    "NtUserUpdateInstance",
    "NtUserUpdateLayeredWindow",
    "NtUserUpdatePerUserSystemParameters",
    "NtUserUpdateWindowInputSinkHints",
    "NtUserUpdateWindowTrackingInfo",
    "NtUserUserHandleGrantAccess",
    "NtUserValidateHandleSecure",
    "NtUserValidateRect",
    "NtUserValidateTimerCallback",
    "NtUserVkKeyScanEx",
    "NtUserWaitAvailableMessageEx",
    "NtUserWaitForInputIdle",
    "NtUserWaitForMsgAndEvent",
    "NtUserWaitForRedirectionStartComplete",
    "NtUserWaitMessage",
    "NtUserWindowFromPhysicalPoint",
    "NtUserWindowFromPoint",
    "NtUserYieldTask",
    "NtValidateCompositionSurfaceHandle",
    "NtVisualCaptureBits"
];

function _executeCommand(cmd) {
    host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd);
}

function decimalBufferToString(buf, len) {
    var str = "";

    for (let i = 0; i < len; ++i) {
        str += String.fromCharCode(buf[i]);
    }

    return str;
}

function invokeScript() {
    let cl = decimalBufferToString(
        host.currentProcess.Environment.EnvironmentBlock.ProcessParameters.CommandLine.Buffer,
        host.currentProcess.Environment.EnvironmentBlock.ProcessParameters.CommandLine.Length
    );

    // If the process is not a content process (e.g. parent or GPU), don't set
    // up our breakpoints.
    if (cl.includes(" tab")) {
        return;
    }
    for (var syscall of WIN32K_SYSCALLS) {
        if (EXCLUDED_WIN32K_SYSCALLS.includes(syscall)) {
            continue;
        }
        _executeCommand(
            `bp WIN32U!${syscall} ".echo '===WIN32K-START==='; k; .echo '===WIN32K-END==='; g"`
        );
    }
}
