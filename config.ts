// Copyright 2016-2019, Pulumi Corporation.  All rights reserved.

import * as azure from "@pulumi/azure";
import * as pulumi from "@pulumi/pulumi";
import * as azuread from "@pulumi/azuread";

let __config = require('../config/aks_service_infos.json');


// Parse and export configuration variables for this stack.
const config = new pulumi.Config();
export const password = config.require("password");
const location = __config.aks_config.location
export const sshPublicKey = config.require("sshPublicKey");
export const resourceGroup = new azure.core.ResourceGroup("aks", { location });
// 8GO?HVlP0witz-8+1aitzy]*caY1jz+[
// Create the AD service principal for the K8s cluster.
export const adApp = new azuread.Application("aks");

const adSp = new azuread.ServicePrincipal("aksSp", { applicationId: adApp.applicationId });
export const adSpPassword = new azuread.ServicePrincipalPassword("aksSpPassword", {
    servicePrincipalId: adSp.id,
    value: password,
    endDate: "2099-01-01T00:00:00Z",
});