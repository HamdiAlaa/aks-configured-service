import * as azure from "@pulumi/azure";
import * as k8s from "@pulumi/kubernetes";
import * as config from "./config";
let __ = require('../config/__aks.json');


// Now allocate an AKS cluster.
export const k8sCluster = new azure.containerservice.KubernetesCluster(`${__.cluster_config.cluster_name}-${__.cluster_config.type}`, {
    resourceGroupName: config.resourceGroup.name,
    location: __.cluster_config.location,

    agentPoolProfiles: [{
        name: `${__.cluster_config.type}node`,
        count: __.cluster_config.node_number,
        vmSize: __.cluster_config.node_size,
    

    }],
    dnsPrefix: `${__.cluster_config.type}-${__.cluster_config.cluster_name}-dns`,
    linuxProfile: {
        adminUsername: __.cluster_config.admin_username,
        sshKey: {
            keyData: config.sshPublicKey,
        },
    },

    servicePrincipal: {
        clientId: __.account.client_id ,
        clientSecret:__.account.client_secret,
    },
});

// Expose a K8s provider instance using our custom cluster instance.
export const k8sProvider = new k8s.Provider(`aks-${__.cluster_config.type}-provider`, {
    kubeconfig: k8sCluster.kubeConfigRaw,
});
