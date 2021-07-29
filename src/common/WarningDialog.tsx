import React from 'react';

import Dialog, { ModalSize } from './Dialog';
import { Action } from './Button';
import Icon from './Icon';

import { Children } from './types/Helpers';

import './WarningDialog.css';

export interface Props {
    show: boolean,
    modalTestId?: string,
    actions: Action[],
    size: ModalSize,
    children: Children,
}

export default function WarningDialog(props: Props) {

    return (
        <Dialog
            show={ props.show }
            size={ props.size }
            actions={ props.actions }
            modalTestId={ props.modalTestId }
        >
            <Icon
                icon={{
                    id: "warning"
                }}
            />
            <p className="dialog-text">
                { props.children }
            </p>
        </Dialog>
    );
}
