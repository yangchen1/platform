// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import SearchableUserList from 'components/searchable_user_list.jsx';
import TeamMembersDropdown from 'components/team_members_dropdown.jsx';

import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import {searchUsers, loadProfilesAndTeamMembers, loadTeamMembersForProfilesList} from 'actions/user_actions.jsx';
import {getTeamStats} from 'utils/async_client.jsx';

import Constants from 'utils/constants.jsx';

import React from 'react';

const USERS_PER_PAGE = 50;

export default class MemberListTeam extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onStatsChange = this.onStatsChange.bind(this);
        this.search = this.search.bind(this);
        this.loadComplete = this.loadComplete.bind(this);

        const stats = TeamStore.getCurrentStats();

        this.state = {
            users: UserStore.getProfileListInTeam(),
            teamMembers: Object.assign([], TeamStore.getMembersInTeam()),
            total: stats.member_count,
            search: false,
            loading: true
        };
    }

    componentDidMount() {
        UserStore.addInTeamChangeListener(this.onChange);
        TeamStore.addChangeListener(this.onChange);
        TeamStore.addStatsChangeListener(this.onStatsChange);

        loadProfilesAndTeamMembers(0, Constants.PROFILE_CHUNK_SIZE, TeamStore.getCurrentId(), this.loadComplete);
        getTeamStats(TeamStore.getCurrentId());
    }

    componentWillUnmount() {
        UserStore.removeInTeamChangeListener(this.onChange);
        TeamStore.removeChangeListener(this.onChange);
        TeamStore.removeStatsChangeListener(this.onStatsChange);
    }

    loadComplete() {
        this.setState({loading: false});
    }

    onChange() {
        if (!this.state.search) {
            this.setState({users: UserStore.getProfileListInTeam()});
        }

        this.setState({teamMembers: Object.assign([], TeamStore.getMembersInTeam())});
    }

    onStatsChange() {
        const stats = TeamStore.getCurrentStats();
        this.setState({total: stats.member_count});
    }

    nextPage(page) {
        loadProfilesAndTeamMembers((page + 1) * USERS_PER_PAGE, USERS_PER_PAGE);
    }

    search(term) {
        if (term === '') {
            this.setState({search: false, users: UserStore.getProfileListInTeam()});
            return;
        }

        searchUsers(
            term,
            TeamStore.getCurrentId(),
            {},
            (users) => {
                this.setState({loading: true, search: true, users});
                loadTeamMembersForProfilesList(users, TeamStore.getCurrentId(), this.loadComplete);
            }
        );
    }

    render() {
        let teamMembersDropdown = null;
        if (this.props.isAdmin) {
            teamMembersDropdown = [TeamMembersDropdown];
        }

        const teamMembers = this.state.teamMembers;
        const users = this.state.users;
        const actionUserProps = {};

        let usersToDisplay;
        if (this.state.loading) {
            usersToDisplay = null;
        } else {
            usersToDisplay = [];

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (teamMembers[user.id]) {
                    usersToDisplay.push(user);
                    actionUserProps[user.id] = {
                        teamMember: teamMembers[user.id]
                    };
                }
            }
        }

        return (
            <SearchableUserList
                style={this.props.style}
                users={usersToDisplay}
                usersPerPage={USERS_PER_PAGE}
                total={this.state.total}
                nextPage={this.nextPage}
                search={this.search}
                actions={teamMembersDropdown}
                actionUserProps={actionUserProps}
            />
        );
    }
}

MemberListTeam.propTypes = {
    style: React.PropTypes.object,
    isAdmin: React.PropTypes.bool
};
