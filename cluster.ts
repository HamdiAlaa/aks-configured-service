// Copyright 2016-2019, Pulumi Corporation.  All rights reserved.

import * as azure from "@pulumi/azure";
import * as azuread from "@pulumi/azuread";
import * as k8s from "@pulumi/kubernetes";
import * as config from "./config";
const __config = require('../config/aks_service_infos.json');

// Create the AD service principal for the K8s cluster.
const adApp = new azuread.Application("aks");
const adSp = new azuread.ServicePrincipal("aksSp", { applicationId: adApp.applicationId });
const adSpPassword = new azuread.ServicePrincipalPassword("aksSpPassword", {
    servicePrincipalId: adSp.id,
    value: config.password,
    endDate: "2099-01-01T00:00:00Z",
});

// Now allocate an AKS cluster.

export const k8sCluster = new azure.containerservice.KubernetesCluster(`${__config.aks_config.cluster_name}`, {
    resourceGroupName: config.resourceGroup.name,
    location: config.location,

    agentPoolProfiles: [{
        name: "aksagentpool",
        count: __config.aks_config.node_number,
        vmSize: __config.aks_config.node_size,
    

    }],
    dnsPrefix: `test-kube-dns`,
    linuxProfile: {
        adminUsername: __config.aks_config.admin__username,
        sshKey: {
            keyData: config.sshPublicKey,
        },
    },

    servicePrincipal: {
        clientId: adApp.applicationId,
        clientSecret: adSpPassword.value,
    },
});

// Expose a K8s provider instance using our custom cluster instance.
export const k8sProvider = new k8s.Provider("aksK8s", {
    kubeconfig: k8sCluster.kubeConfigRaw,
});
