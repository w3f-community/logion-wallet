import { CollectionItem } from "../logion-chain/Types";
import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

import './CollectionItemCellRow.css';
import { Col } from "react-bootstrap";
import MenuIcon from "../common/MenuIcon";
import { LIGHT_MODE } from "../legal-officer/Types";

export interface Props {
    item: CollectionItem
}

export default function CollectionItemCellRow(props: Props) {
    const { id, description } = props.item
    return (
        <div className="CollectionItemCellRow">
            <Row>
                <Col>
                    <h2><MenuIcon icon={{id:"collection"}} background={ LIGHT_MODE.topMenuItems.iconGradient }/> Collection Item</h2>
                    <p>This collection item identified hereafter with the
                        following data benefits from the present Collection LOC scope:</p>
                </Col>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item identification:">
                    { id }
                </CertificateCell>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item description:">
                    <pre>{ description }</pre>
                </CertificateCell>
            </Row>
        </div>
    )
}
