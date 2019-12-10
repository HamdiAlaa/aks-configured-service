import * as azure from "@pulumi/azure";
import * as k8s from "@pulumi/kubernetes";
import * as config from "./config";
let __ = require('../config/__aks.json');



// Now allocate an AKS cluster.

export const k8sCluster = new azure.containerservice.KubernetesCluster(`${__.aks_config.cluster_name}`, {
    resourceGroupName: config.resourceGroup.name,
    location: __.aks_config.location,

    agentPoolProfiles: [{
        name: "aksagentpool",
        count: __.aks_config.node_number,
        vmSize: __.aks_config.node_size,
    

    }],
    dnsPrefix: `test-kube-dns`,
    linuxProfile: {
        adminUsername: __.aks_config.admin__username,
        sshKey: {
            keyData: config.sshPublicKey,
        },
    },

    servicePrincipal: {
        clientId: config.adApp.applicationId,
        clientSecret: config.adSpPassword.value,
    },
});

// Expose a K8s provider instance using our custom cluster instance.
export const k8sProvider = new k8s.Provider("aksK8s", {
    kubeconfig: k8sCluster.kubeConfigRaw,
});
