import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";
import * as App from "./app";

SDK.register("openQueryOnToolbarAction", () => {
    return {
        execute: async (context: any) => {
            App.openQueryOnToolbarAction.execute(context);
            console.log(context);
        }
    }
});

SDK.register("openQueryAction", () => {
    return {
        execute: async (context: any) => {
            App.openQueryAction.execute(context);
        }
    }
});

SDK.register("openWorkItemsAction", () => {
    return {
        execute: async (context: any) => {
            App.openWorkItemsAction.execute(context);
        }
    }
});

// SDK.register("notificationDialog", () => {
//     return {
//         execute: async () => {
//             App.showNotificationDialog.execute();
//         }
//     }
// });

SDK.init();