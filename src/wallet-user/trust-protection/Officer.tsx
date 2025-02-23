import * as css from 'csstype';
import { LegalOfficer } from "@logion/client";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';

import './Officer.css';
import CopyPasteButton from "../../common/CopyPasteButton";
import { Row } from "../../common/Grid";
import { LegalOfficerPostalAddress } from '../../common/LegalOfficerPostalAddress';
import LegalOfficerAdditionalDetails from '../../common/LegalOfficerAdditionalDetails';
import { LegalOfficerContactInfo } from '../../common/LegalOfficerContactInfo';

export interface Props {
    officer: LegalOfficer | null,
    colors: BackgroundAndForegroundColors,
    borderColor?: string,
}

export default function Officer(props: Props) {

    let visibility: css.Property.Visibility;
    if(props.officer !== null) {
        visibility = 'visible';
    } else {
        visibility = 'hidden';
    }
    let border = undefined;
    if(props.borderColor !== undefined) {
        border = `1px solid ${props.borderColor}`;
    }

    const polkadotAddress = props.officer?.address ? props.officer?.address : "";
    return (
        <div className="Officer"
             style={ {
                 visibility,
                 color: props.colors.foreground,
                 backgroundColor: props.colors.background,
                 border,
             } }
        >
            <Row className="address">
                <span className="text">{ polkadotAddress }</span>
                <CopyPasteButton value={ polkadotAddress } className="medium" />
            </Row>
            <Row className="contact">
                { props.officer && <LegalOfficerContactInfo identity={ props.officer.userIdentity } showName={ false } /> }
            </Row>
            <Row className="details">
                { props.officer && <LegalOfficerPostalAddress address={ props.officer.postalAddress } /> }
                { props.officer && <LegalOfficerAdditionalDetails additionalDetails={ props.officer.additionalDetails } /> }
            </Row>
        </div>
    );
}
