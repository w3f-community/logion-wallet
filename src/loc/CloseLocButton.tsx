import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";
import { vouchRecovery } from "@logion/node-api/dist/Recovery";
import { Col, Row } from "react-bootstrap";

import Button from "../common/Button";
import ProcessStep from "../legal-officer/ProcessStep";
import Alert from "../common/Alert";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useCommonContext } from "../common/CommonContext";

import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";

import { acceptProtectionRequest } from "./Model";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { PROTECTION_REQUESTS_PATH, RECOVERY_REQUESTS_PATH } from "../legal-officer/LegalOfficerPaths";
import StaticLabelValue from "../common/StaticLabelValue";
import { useLogionChain } from "../logion-chain";
import { signAndSend } from "../logion-chain/Signature";

import './CloseLocButton.css';

enum CloseStatus {
    NONE,
    START,
    ACCEPT,
    CLOSE_PENDING,
    CLOSING,
    ERROR,
    VOUCHING,
    ACCEPTING,
    DONE
}

interface CloseState {
    status: CloseStatus;
}

export interface Props {
    protectionRequest?: ProtectionRequest | null;
}

export default function CloseLocButton(props: Props) {
    const navigate = useNavigate();
    const { accounts, axiosFactory, api } = useLogionChain();
    const { refresh } = useCommonContext();
    const { refreshRequests } = useLegalOfficerContext();
    const { closeExtrinsic, close, locItems, locId } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ disabled, setDisabled ] = useState<boolean>(false);
    const [ signAndSubmitVouch, setSignAndSubmitVouch ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (closeState.status === CloseStatus.CLOSE_PENDING) {
            setCloseState({ status: CloseStatus.CLOSING });
            const signAndSubmit: SignAndSubmit = closeExtrinsic!();
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ closeExtrinsic, closeState, setCloseState ]);

    useEffect(() => {
        if (locItems.findIndex(locItem => locItem.status === "DRAFT") < 0) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [ locItems, setDisabled ]);

    const onCloseSuccess = useCallback(() => {
        if(props.protectionRequest && !props.protectionRequest.isRecovery) {
            setCloseState({ status: CloseStatus.ACCEPTING });
        } else if(props.protectionRequest && props.protectionRequest.isRecovery) {
            setCloseState({ status: CloseStatus.VOUCHING });

            const currentAddress = accounts!.current!.address;
            const signAndSubmit: SignAndSubmit = (callback, errorCallback) => signAndSend({
                signerId: currentAddress,
                callback,
                errorCallback,
                submittable: vouchRecovery({
                    api: api!,
                    lost: props.protectionRequest!.addressToRecover!,
                    rescuer: props.protectionRequest!.requesterAddress,
                })
            });
            setSignAndSubmitVouch(() => signAndSubmit);
        } else {
            setCloseState({ status: CloseStatus.NONE });
            close!();
            refresh!(false);
        }
    }, [ setCloseState, props.protectionRequest, accounts, api, close, refresh ]);

    useEffect(() => {
        if (closeState.status === CloseStatus.ACCEPTING) {
            setCloseState({ status: CloseStatus.NONE });
            (async function() {
                const currentAddress = accounts!.current!.address;
                await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                    requestId: props.protectionRequest!.id,
                    locId: locId!
                });
                close!();
                refresh!(false);
                refreshRequests!(false);

                if(props.protectionRequest?.isRecovery) {
                    navigate({pathname: RECOVERY_REQUESTS_PATH, search: "?tab=history"});
                } else {
                    navigate({pathname: PROTECTION_REQUESTS_PATH, search: "?tab=history"});
                }
            })();
        }
    }, [ closeExtrinsic, closeState, setCloseState, accounts, axiosFactory, close, locId, navigate, props.protectionRequest, refresh, refreshRequests ]);

    let closeButtonText;
    let firstStatus: CloseStatus;
    let iconId;
    if(props.protectionRequest) {
        closeButtonText = "Close and accept request";
        firstStatus = CloseStatus.ACCEPT;
        if(props.protectionRequest.isRecovery) {
            iconId = "recovery";
        } else {
            iconId = "shield";
        }
    } else {
        closeButtonText = "Close LOC";
        firstStatus = CloseStatus.START;
        iconId = "lock";
    }

    return (
        <div className="CloseLocButton">
            <Button
                onClick={ () => setCloseState({ status: firstStatus }) }
                className="close"
                disabled={ disabled }
            >
                <Icon icon={{ id: iconId }} height="19px" /><span className="text">{ closeButtonText }</span>
            </Button>
            <ProcessStep
                active={ closeState.status === CloseStatus.ACCEPT }
                title="Protection request approval"
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: "confirm",
                        buttonText: "Confirm",
                        buttonVariant: "polkadot",
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.CLOSE_PENDING }),
                    }
                ]}
            >
                <p>You are about to close the identity LOC (ID: { locId.toDecimalString() }) you created with regard to a request for protection.</p>
                <p>By clicking on "Confirm" below, you will definitively accept to protect the account of the following person:</p>

                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Account address'
                            value={ props.protectionRequest?.requesterAddress || "" }
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='First Name'
                            value={ props.protectionRequest?.userIdentity.firstName || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Last Name'
                            value={ props.protectionRequest?.userIdentity.lastName || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='E-mail'
                            value={ props.protectionRequest?.userIdentity.email || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Phone Number'
                            value={ props.protectionRequest?.userIdentity.phoneNumber || "" }
                        />
                    </Col>
                </Row>

                <h3>Address</h3>

                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Line 1'
                            value={ props.protectionRequest?.userPostalAddress.line1 || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Line 2'
                            value={ props.protectionRequest?.userPostalAddress.line2 || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Postal Code'
                            value={ props.protectionRequest?.userPostalAddress.postalCode || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='City'
                            value={ props.protectionRequest?.userPostalAddress.city || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Country'
                            value={ props.protectionRequest?.userPostalAddress.country || "" }
                        />
                    </Col>
                </Row>

                <p>I executed my due diligence and accept to be the legal officer of this user:</p>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.START || closeState.status === CloseStatus.CLOSE_PENDING }
                title="Close this Case (1/2)"
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: 'proceed',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: closeState.status === CloseStatus.START,
                        callback: () => setCloseState({ status: CloseStatus.CLOSE_PENDING })
                    }
                ]}
            >
                <Alert variant="info">
                    <p>Warning: after processing and blockchain publication, this case cannot be opened again and therefore
                        will be completely sealed.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSING }
                title="Close this Case (2/2)"
                nextSteps={[]}
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ onCloseSuccess }
                    onError={ () => setCloseState({ status: CloseStatus.ERROR }) }
                />
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.ERROR }
                title="Close this Case (2/2)"
                nextSteps={[
                    {
                        id: 'ok',
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    }
                ]}
            >
                <Alert variant="danger">
                    Could not close LOC.
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.VOUCHING }
                title="Vouching"
                nextSteps={[]}
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmitVouch }
                    onSuccess={ () => setCloseState({ status: CloseStatus.ACCEPTING }) }
                    onError={ () => setCloseState({ status: CloseStatus.ERROR }) }
                />
            </ProcessStep>
        </div>
    )
}
