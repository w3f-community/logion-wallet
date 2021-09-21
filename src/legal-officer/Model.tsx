import { AxiosInstance } from 'axios';
import { Moment } from 'moment';
import { toIsoString } from '../logion-chain/datetime';

import {
    AssetDescription,
    LegalOfficerDecision,
} from '../common/types/ModelTypes';
import { RecoveryInfo } from './Types';

export interface RejectRequestParameters {
    requestId: string,
    signature: string,
    rejectReason: string,
    signedOn: Moment,
}

export async function rejectRequest(
    axios: AxiosInstance,
    parameters: RejectRequestParameters
): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/reject`, {
        signature: parameters.signature,
        rejectReason: parameters.rejectReason,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export interface AcceptRequestParameters {
    requestId: string,
    signature: string,
    signedOn: Moment,
}

export interface AcceptResult {
    sessionToken: string,
}

export async function acceptRequest(
    axios: AxiosInstance,
    parameters: AcceptRequestParameters
): Promise<AcceptResult> {
    const response = await axios.post(`/api/token-request/${parameters.requestId}/accept`, {
        signature: parameters.signature,
        signedOn: toIsoString(parameters.signedOn),
    });
    return {
        sessionToken: response.data.sessionToken
    };
}

export interface SetAssetDescriptionRequestParameters {
    requestId: string,
    description: AssetDescription,
    sessionToken: string,
}

export async function setAssetDescription(
    axios: AxiosInstance,
    parameters: SetAssetDescriptionRequestParameters
): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/asset`, {
        description: parameters.description,
        sessionToken: parameters.sessionToken,
    });
}

export interface RejectProtectionRequestParameters {
    requestId: string,
    signature: string,
    rejectReason: string,
    signedOn: Moment,
    legalOfficerAddress: string,
}

export async function rejectProtectionRequest(
    axios: AxiosInstance,
    parameters: RejectProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/reject`, {
        signature: parameters.signature,
        legalOfficerAddress: parameters.legalOfficerAddress,
        rejectReason: parameters.rejectReason,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export interface AcceptProtectionRequestParameters {
    requestId: string,
    signature: string,
    signedOn: Moment,
    legalOfficerAddress: string,
}

export async function acceptProtectionRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`, {
        signature: parameters.signature,
        legalOfficerAddress: parameters.legalOfficerAddress,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export function decision(legalOfficerAddress: string | undefined, decisions: LegalOfficerDecision[]): (LegalOfficerDecision | null) {
    for(let i = 0; i < decisions.length; ++i) {
        const decision = decisions[i];
        if(decision.legalOfficerAddress === legalOfficerAddress) {
            return decision;
        }
    }
    return null;
}

export async function fetchRecoveryInfo(
    axios: AxiosInstance,
    requestId: string
): Promise<RecoveryInfo> {
    const response = await axios.put(`/api/protection-request/${requestId}/recovery-info`, {})
    return response.data;
}

export interface RejectLocRequestParameters {
    requestId: string;
    rejectReason: string;
}

export async function rejectLocRequest(
    axios: AxiosInstance,
    parameters: RejectLocRequestParameters
): Promise<void> {
    await axios.post(`/api/loc-request/${parameters.requestId}/reject`, {
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptLocRequestParameters {
    requestId: string;
}

export async function acceptLocRequest(
    axios: AxiosInstance,
    parameters: AcceptLocRequestParameters
): Promise<void> {
    await axios.post(`/api/loc-request/${parameters.requestId}/accept`, { });
}
