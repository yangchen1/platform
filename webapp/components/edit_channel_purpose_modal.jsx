// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PreferenceStore from 'stores/preference_store.jsx';

import * as AsyncClient from 'utils/async_client.jsx';
import Client from 'client/web_client.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

export default class EditChannelPurposeModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleHide = this.handleHide.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.onPreferenceChange = this.onPreferenceChange.bind(this);

        this.ctrlSend = PreferenceStore.getBool(Constants.Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter');

        this.state = {
            serverError: '',
            show: true,
            submitted: false
        };
    }

    componentDidMount() {
        PreferenceStore.addChangeListener(this.onPreferenceChange);
        Utils.placeCaretAtEnd(this.refs.purpose);
    }

    componentWillUnmount() {
        PreferenceStore.removeChangeListener(this.onPreferenceChange);
    }

    handleHide() {
        this.setState({show: false});
    }

    onPreferenceChange() {
        this.ctrlSend = PreferenceStore.getBool(Constants.Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter');
    }

    handleKeyDown(e) {
        if (this.ctrlSend && e.keyCode === Constants.KeyCodes.ENTER && e.ctrlKey) {
            e.preventDefault();
            this.handleSave(e);
        } else if (!this.ctrlSend && e.keyCode === Constants.KeyCodes.ENTER && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            this.handleSave(e);
        }
    }

    handleSave() {
        if (!this.props.channel) {
            return;
        }

        this.setState({submitted: true});

        Client.updateChannelPurpose(
            this.props.channel.id,
            this.refs.purpose.value.trim(),
            () => {
                AsyncClient.getChannel(this.props.channel.id);

                this.handleHide();
            },
            (err) => {
                if (err.id === 'api.context.invalid_param.app_error') {
                    this.setState({serverError: Utils.localizeMessage('edit_channel_puropse_modal.error', 'This channel purpose is too long, please enter a shorter one')});
                } else {
                    this.setState({serverError: err.message});
                }
            }
        );
    }

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='form-group has-error'>
                    <br/>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        let title = (
            <span>
                <FormattedMessage
                    id='edit_channel_purpose_modal.title1'
                    defaultMessage='Edit Purpose'
                />
            </span>
        );
        if (this.props.channel.display_name) {
            title = (
                <span>
                    <FormattedMessage
                        id='edit_channel_purpose_modal.title2'
                        defaultMessage='Edit Purpose for '
                    />
                    <span className='name'>{this.props.channel.display_name}</span>
                </span>
            );
        }

        let channelType = (
            <FormattedMessage
                id='edit_channel_purpose_modal.channel'
                defaultMessage='Channel'
            />
        );
        if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
            channelType = (
                <FormattedMessage
                    id='edit_channel_purpose_modal.group'
                    defaultMessage='Group'
                />
            );
        }

        return (
            <Modal
                className='modal-edit-channel-purpose'
                ref='modal'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.props.onModalDismissed}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMessage
                            id='edit_channel_purpose_modal.body'
                            defaultMessage='Describe how this {type} should be used. This text appears in the channel list in the "More..." menu and helps others decide whether to join.'
                            values={{
                                type: (channelType)
                            }}
                        />
                    </p>
                    <textarea
                        ref='purpose'
                        className='form-control no-resize'
                        rows='6'
                        maxLength='128'
                        defaultValue={this.props.channel.purpose}
                        onKeyDown={this.handleKeyDown}
                    />
                    {serverError}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.handleHide}
                    >
                        <FormattedMessage
                            id='edit_channel_purpose_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        disabled={this.state.submitted}
                        onClick={this.handleSave}
                    >
                        <FormattedMessage
                            id='edit_channel_purpose_modal.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

EditChannelPurposeModal.propTypes = {
    channel: React.PropTypes.object,
    onModalDismissed: React.PropTypes.func.isRequired
};
