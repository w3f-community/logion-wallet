import React from "react";

import { Col } from '../common/Grid';
import Detail from "../common/Detail";

import { ProtectionRequest } from "../common/types/ModelTypes";
import { useLegalOfficerContext } from "./LegalOfficerContext";

export interface ProtectionRequestDetailsProps {
    request : ProtectionRequest,
}

export default function ProtectionRequestDetails(props: ProtectionRequestDetailsProps) {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <>
            <Col
                style={{width: "250px"}}
            >
                <Detail
                    label="Email"
                    value={ props.request.userIdentity.email }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col
                style={{width: "150px"}}
            >
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity.phoneNumber }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="Line 1"
                    value={ props.request.userPostalAddress.line1 }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col
                style={{width: "120px"}}
            >
                <Detail
                    label="Postal code"
                    value={ props.request.userPostalAddress.postalCode }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="City"
                    value={ props.request.userPostalAddress.city }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="Country"
                    value={ props.request.userPostalAddress.country }
                    colorTheme={ colorTheme }
                />
            </Col>
        </>
    );
}
