import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import Addresses from './types/Addresses';

import './AddressSwitcher.css';
import AccountAddress, { AccountAddressColors } from './AccountAddress';

export interface Props {
    addresses: Addresses,
    colors: AccountAddressColors,
    selectAddress: (userAddress: string) => void,
}

export default function AddressSwitcher(props: Props) {

    console.log(props.addresses.currentAddress);

    return (
        <div
            className="AddressSwitcher"
            style={{
                color: props.colors.foreground
            }}
        >
            <Dropdown>
                <Dropdown.Toggle id="address-switcher-toggle">
                    <div className="address-data">
                        <AccountAddress
                            hint="Click to select another address"
                            address={ props.addresses.currentAddress }
                            colors={ props.colors }
                        />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        props.addresses.addresses.map(address => (
                            <Dropdown.Item
                                key={ address.address }
                                onClick={ () => props.selectAddress(address.address) }
                                style={{
                                    color: props.colors.foreground,
                                    backgroundColor: props.colors.background,
                                }}
                            >
                                <AccountAddress
                                    address={ address }
                                    colors={ props.colors }
                                />
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
