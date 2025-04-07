import { CommonServiceIds, IProjectPageService, IGlobalMessagesService, ILocationService, IHostPageLayoutService } from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";

namespace SupportedActions {
    export const OpenQuery = "OpenQuery";
}

namespace WellKnownQueries {
    export const AssignedToMe = "A2108D31-086C-4FB0-AFDA-097E4CC46DF4";
    export const UnsavedWorkItems = "B7A26A56-EA87-4C97-A504-3F028808BB9F";
    export const FollowedWorkItems = "202230E0-821E-401D-96D1-24A7202330D0";
    export const CreatedBy = "53FB153F-C52C-42F1-90B6-CA17FC3561A8";
    export const SearchResults = "2CBF5136-1AE5-4948-B59A-36F526D9AC73";
    export const CustomWiql = "08E20883-D56C-4461-88EB-CE77C0C7936D";
    export const RecycleBin = "2650C586-0DE4-4156-BA0E-14BCFB664CCA";
}

export var queryExclusionList = [
    WellKnownQueries.AssignedToMe,
    WellKnownQueries.UnsavedWorkItems,
    WellKnownQueries.FollowedWorkItems,
    WellKnownQueries.CreatedBy,
    WellKnownQueries.SearchResults,
    WellKnownQueries.CustomWiql,
    WellKnownQueries.RecycleBin];

export function isSupportedQueryId(queryId: string) {
    return queryId && queryExclusionList.indexOf(queryId.toUpperCase()) === -1;
}

export function generateUrl(action: string, collection: string, project: string, qid?: string | undefined, wids?: number[] | undefined, columns?: string[] | undefined): string {
    let url = `tfs://ExcelRequirements/${action}?cn=${collection}&proj=${project}`;

    if (!qid) {
        throw new Error(`'qid' must be provided for '${SupportedActions.OpenQuery}' action.`);
    }
    url += `&qid=${qid}`;

    if (url.length > 2000) {
        throw new Error('Generated url is exceeds the maxlength, please reduce the number of work items you selected.');
    }

    return url;
}

export interface IQueryObject {
    id: string;
    isPublic: boolean;
    name: string;
    path: string;
    wiql: string;
}

export interface IActionContext {
    id?: number;            // From card
    workItemId?: number;    // From work item form
    query?: IQueryObject;
    queryText?: string;
    ids?: number[];
    workItemIds?: number[]; // From backlog/iteration (context menu) and query results (toolbar and context menu)
    columns?: string[];
}

export var openQueryAction = {
    execute: async (actionContext: IActionContext) => {
        if (actionContext && actionContext.query && actionContext.query.id) {
            const qid = actionContext.query.id;
            const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
            const project = await projectService.getProject();
            if(project) {
                const locationService = await SDK.getService<ILocationService>(CommonServiceIds.LocationService);
                const collectionUri = await locationService.getServiceLocation();
                const url = generateUrl(SupportedActions.OpenQuery, collectionUri, encodeURI(project.name), qid);
                openUrl(url);
            }
            else{
                alert("Unable to perform operation. Not a valid team context.");
            }
        }
        else {
            alert("Unable to perform operation. To use this extension, queries must be saved in My Queries or Shared Queries.");
        }
    }
};

export var openQueryOnToolbarAction = {
    execute: async (actionContext: IActionContext) => {
            if (actionContext && actionContext.query && actionContext.query.wiql && isSupportedQueryId(actionContext.query.id)) {
                const qid = actionContext.query.id;
                const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
                const project = await projectService.getProject();
                if(project) {
                    const locationService = await SDK.getService<ILocationService>(CommonServiceIds.LocationService);
                    const collectionUri = await locationService.getServiceLocation();
                    const url = generateUrl(SupportedActions.OpenQuery, collectionUri, encodeURI(project.name), qid);
                    openUrl(url);
                }
                else{
                    alert("Unable to perform operation. Not a valid team context.");
                }
            }
            else {
                alert("Unable to perform operation. To use this extension, queries must be saved in My Queries or Shared Queries.");
            }
    }
};

export var showNotificationDialog = {
    execute: async () => {
        showCustomDialog();
    }
};

const showCustomDialog = async () => {
    const dialogKey = "openInExcelDialogShown";
    if (sessionStorage.getItem(dialogKey)) {
        console.log("Dialog has already been shown.");
        return;
    }

    try {
        const messageService = await SDK.getService<IGlobalMessagesService>(CommonServiceIds.GlobalMessagesService);
            messageService.addDialog({
                title: "Open in Excel",
                messageLinks: [
                    { href: "https://aka.ms/open-in-excel", name: "Azure DevOps Open in Excel" },
                    { href: "https://aka.ms/devopsexcel", name: "here" }
                ],
                messageFormat: "Thanks for using {0}. This extension requires Microsoft Excel, and an installed version of Visual Studio or the free Azure DevOps Office Integration client. Click {1} to learn more.",
        });

        setTimeout(() => {
            messageService.closeDialog();
        }, 10000);
    } catch (error) {
        console.error("SDK version not available in this version of ADO.", error);

        try {
            const dialogService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
            dialogService.openMessageDialog("Thanks for using this extension.\
                 This extension requires Microsoft Excel, and an installed version of Visual Studio or the free Azure DevOps Office Integration client.",
                 { title: "Open in Excel", okText: "Close", showCancel: false });

            sessionStorage.setItem(dialogKey, "true");
        } catch (error) {
            console.error("Unable to perform operation. ADO version not supported.", error);
        }
    }
};

function openUrl(url: string) {
    showNotificationDialog.execute();
    SDK.getService(CommonServiceIds.HostNavigationService).then((navigationService: any) => {
        navigationService.navigate(url);
    });
}