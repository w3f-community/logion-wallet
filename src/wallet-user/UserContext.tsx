import React, { useContext, useEffect, useCallback, useReducer, Reducer } from "react";
import { Option } from '@polkadot/types';

import { useLogionChain } from '../logion-chain';
import { RecoveryConfig, getRecoveryConfig, getProxy } from '../logion-chain/Recovery';
import { Children } from '../common/types/Helpers';

import {
    CreateTokenRequest,
    createTokenRequest as modelCreateTokenRequest,
} from "./Model";
import { TokenizationRequest, ProtectionRequest } from "../common/types/ModelTypes";
import { fetchRequests, fetchProtectionRequests } from "../common/Model";
import {
    CreateProtectionRequest,
    createProtectionRequest as modelCreateProtectionRequest,
} from "./trust-protection/Model";
import { useCommonContext } from '../common/CommonContext';
import { DARK_MODE } from './Types';

export interface UserContext {
    dataAddress: string | null,
    createTokenRequest: ((request: CreateTokenRequest) => Promise<TokenizationRequest>) | null,
    createdTokenRequest: TokenizationRequest | null,
    fetchForAddress: string | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    acceptedTokenizationRequests: TokenizationRequest[] | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    createProtectionRequest: ((request: CreateProtectionRequest) => Promise<void>) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    acceptedProtectionRequests: ProtectionRequest[] | null,
    rejectedProtectionRequests: ProtectionRequest[] | null,
    recoveryConfig: Option<RecoveryConfig> | null,
    recoveredAddress?: string | null,
}

function initialContextValue(): UserContext {
    return {
        dataAddress: null,
        createTokenRequest: null,
        createdTokenRequest: null,
        fetchForAddress: null,
        pendingTokenizationRequests: null,
        acceptedTokenizationRequests: null,
        rejectedTokenizationRequests: null,
        refreshRequests: null,
        createProtectionRequest: null,
        pendingProtectionRequests: null,
        acceptedProtectionRequests: null,
        rejectedProtectionRequests: null,
        recoveryConfig: null,
    }
}

const UserContextObject: React.Context<UserContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_CREATE_TOKEN_REQUEST_FUNCTION'
    | 'SET_CREATED_TOKEN_REQUEST'
    | 'SET_REFRESH_REQUESTS_FUNCTION'
    | 'SET_CREATE_PROTECTION_REQUEST_FUNCTION'
;

interface Action {
    type: ActionType,
    createTokenRequest?: (request: CreateTokenRequest) => Promise<TokenizationRequest>,
    createdTokenRequest?: TokenizationRequest,
    dataAddress?: string,
    pendingTokenizationRequests?: TokenizationRequest[],
    acceptedTokenizationRequests?: TokenizationRequest[],
    rejectedTokenizationRequests?: TokenizationRequest[],
    pendingProtectionRequests?: ProtectionRequest[],
    acceptedProtectionRequests?: ProtectionRequest[],
    rejectedProtectionRequests?: ProtectionRequest[],
    recoveryConfig?: Option<RecoveryConfig>,
    refreshRequests?: (clearBeforeRefresh: boolean) => void,
    createProtectionRequest?: (request: CreateProtectionRequest) => Promise<void>,
    clearBeforeRefresh?: boolean,
    recoveredAddress?: string | null,
}

const reducer: Reducer<UserContext, Action> = (state: UserContext, action: Action): UserContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            console.log("fetch in progress for " + action.dataAddress!);
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingTokenizationRequests: null,
                    acceptedTokenizationRequests: null,
                    rejectedTokenizationRequests: null,
                    pendingProtectionRequests: null,
                    acceptedProtectionRequests: null,
                    rejectedProtectionRequests: null,
                    recoveryConfig: null,
                    recoveredAddress: null,
                };
            } else {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                };
            }
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                console.log("setting data for " + state.fetchForAddress);
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    pendingTokenizationRequests: action.pendingTokenizationRequests!,
                    acceptedTokenizationRequests: action.acceptedTokenizationRequests!,
                    rejectedTokenizationRequests: action.rejectedTokenizationRequests!,
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    acceptedProtectionRequests: action.acceptedProtectionRequests!,
                    rejectedProtectionRequests: action.rejectedProtectionRequests!,
                    recoveryConfig: action.recoveryConfig!,
                    recoveredAddress: action.recoveredAddress!,
                };
            } else {
                console.log(`Skipping data because ${action.dataAddress} <> ${state.fetchForAddress}`);
                return state;
            }
        case 'SET_CREATE_TOKEN_REQUEST_FUNCTION':
            return {
                ...state,
                createTokenRequest: action.createTokenRequest!
            };
        case 'SET_CREATED_TOKEN_REQUEST':
            return {
                ...state,
                createdTokenRequest: action.createdTokenRequest!
            };
        case "SET_REFRESH_REQUESTS_FUNCTION":
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
            };
        case "SET_CREATE_PROTECTION_REQUEST_FUNCTION":
            return {
                ...state,
                createProtectionRequest: action.createProtectionRequest!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: Children
}

export function UserContextProvider(props: Props) {
    const { currentAddress, colorTheme, setColorTheme } = useCommonContext();
    const { api, apiState } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if (contextValue.createTokenRequest === null) {
            const createTokenRequest = async (request: CreateTokenRequest): Promise<TokenizationRequest> => {
                const createdTokenRequest = await modelCreateTokenRequest(request);
                dispatch({
                    type: "SET_CREATED_TOKEN_REQUEST",
                    createdTokenRequest
                });
                return createdTokenRequest;
            }
            dispatch({
                type: 'SET_CREATE_TOKEN_REQUEST_FUNCTION',
                createTokenRequest
            });
        }
    }, [contextValue, dispatch]);

    useEffect(() => {
        if(colorTheme !== DARK_MODE && setColorTheme !== null) {
            setColorTheme(DARK_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        if(api !== null) {
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearBeforeRefresh
            });

            (async function () {
                const pendingTokenizationRequests = await fetchRequests({
                    requesterAddress: currentAddress,
                    status: "PENDING",
                });
                const acceptedTokenizationRequests = await fetchRequests({
                    requesterAddress: currentAddress,
                    status: "ACCEPTED",
                });
                const rejectedTokenizationRequests = await fetchRequests({
                    requesterAddress: currentAddress,
                    status: "REJECTED",
                });
                const pendingProtectionRequests = await fetchProtectionRequests({
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "PENDING" ],
                    kind: "ANY",
                });
                const acceptedProtectionRequests = await fetchProtectionRequests({
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "ACCEPTED" ],
                    kind: "ANY",
                });
                const rejectedProtectionRequests = await fetchProtectionRequests({
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "REJECTED" ],
                    kind: "ANY",
                });
                const recoveryConfig = await getRecoveryConfig({
                    api: api!,
                    accountId: currentAddress
                });

                let recoveredAddress: string | null = null;
                if(acceptedProtectionRequests.length === 1
                    && acceptedProtectionRequests[0].isRecovery
                    && acceptedProtectionRequests[0].status === "ACTIVATED") {
                    const proxy = await getProxy({
                        api: api!,
                        currentAddress
                    });
                    if(proxy.isSome) {
                        recoveredAddress = proxy.unwrap().toString();
                    }
                }

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    pendingTokenizationRequests,
                    acceptedTokenizationRequests,
                    rejectedTokenizationRequests,
                    pendingProtectionRequests,
                    acceptedProtectionRequests,
                    rejectedProtectionRequests,
                    recoveryConfig,
                    recoveredAddress,
                });
            })();
        }
    }, [ api, dispatch, currentAddress ]);

    useEffect(() => {
        if(apiState === "READY"
                && currentAddress !== ''
                && contextValue.dataAddress !== currentAddress
                && contextValue.fetchForAddress !== currentAddress) {
            refreshRequests(true);
        }
    }, [ apiState, contextValue, currentAddress, refreshRequests, dispatch ]);

    useEffect(() => {
        if(contextValue.refreshRequests === null && apiState === "READY") {
            dispatch({
                type: "SET_REFRESH_REQUESTS_FUNCTION",
                refreshRequests,
            });
        }
    }, [ apiState, refreshRequests, contextValue, dispatch ]);

    useEffect(() => {
        if (contextValue.createProtectionRequest === null && apiState === "READY") {
            const createProtectionRequest = async (request: CreateProtectionRequest): Promise<void> => {
                await modelCreateProtectionRequest(request);
            }
            dispatch({
                type: "SET_CREATE_PROTECTION_REQUEST_FUNCTION",
                createProtectionRequest,
            });
        }
    }, [ apiState, contextValue, refreshRequests, dispatch ]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return useContext(UserContextObject);
}
