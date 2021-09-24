import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Frame from '../../common/Frame';
import { useCommonContext } from "../../common/CommonContext";

import OpenedLocs from './OpenedLocs';
import RequestedLocs from './RequestedLocs';
import RejectedLocs from './RejectedLocs';
import LocCreation from './LocCreation';

export default function TransactionProtection() {
    const { colorTheme } = useCommonContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Transaction Protection"
            subTitle="Logion Officer Cases"
            titleIcon={{
                icon: {
                    id: 'loc'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Row>
                <Col>
                    <Frame
                        title="Open Transaction Protection Case(s)"
                    >
                        <OpenedLocs/>
                        <LocCreation/>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Transaction Protection Request(s)"
                    >
                        <Tabs
                            activeKey={ tabKey }
                            onSelect={ key => setTabKey(key || 'pending') }
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <RequestedLocs/>
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocs/>
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
