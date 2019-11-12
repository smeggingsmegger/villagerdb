import React from "react";
import ReactDOM from "react-dom"
import $ from 'jquery'

import Paginator from './paginator.js';
import SearchResults from './search-results.js';
import Loader from './loader.js';

/**
 *
 */
class Browser extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        // Initialize state.
        this.state = this.props.initialState;

        // Bindings
        this.setPage = this.setPage.bind(this);
    }

    componentDidMount() {
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.setState(event.state);
            } else {
                this.setState(this.props.initialState);
            }
        });
    }
    /**
     *
     * @returns {*}
     */
    render() {
        // Error case.
        if (this.state.error) {
            return (
                <p className="p-3 mb-2 bg-danger text-white">
                    We're having some trouble. Try refreshing the page.
                </p>
            );
        }
        // No results case.
        if (this.state.results.length === 0) {
            return (
                <p>There were no results for your search.</p>
            );
        }

        // Show loader?
        let loader = null;
        if (this.state.isLoading) {
            loader = (
                <Loader/>
            );
        }

        return (
            <div id={this.props.id} className="browser-results-container">
                {loader}
                <Paginator onPageChange={this.setPage}
                           currentPage={this.state.currentPage}
                           startIndex={this.state.startIndex}
                           endIndex={this.state.endIndex}
                           totalCount={this.state.totalCount}
                           totalPages={this.state.totalPages}/>
                <SearchResults results={this.state.results}/>
                <Paginator onPageChange={this.setPage}
                           currentPage={this.state.currentPage}
                           startIndex={this.state.startIndex}
                           endIndex={this.state.endIndex}
                           totalCount={this.state.totalCount}
                           totalPages={this.state.totalPages}/>
            </div>
        );
    }

    setPage(pageNumber) {
        // On update, just consume the state.
        const updateState = (state) => {
            state.isLoading = false;
            history.pushState(state, null, this.buildUrlFromState(state));
            this.setState(state);
        };

        // Make AJAX request to get the page.
        let url = this.state.pageUrlPrefix + pageNumber + '?isAjax=true';
        if (this.state.isSearch) {
            url += '&q=' + this.state.searchQueryString
        }

        this.setState({
            isLoading: true
        });
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: updateState,
            error: this.onError.bind(this)
        });
    }

    onError() {
        this.setState({
            isLoading: false,
            error: true
        });
    }

    buildUrlFromState(state) {
        let url = state.pageUrlPrefix + state.currentPage;
        if (state.isSearch) {
            url += '?q=' + this.state.searchQueryString
        }

        return url;
    }
}

/**
 * When DOM ready, initialize the browser.
 */
$(document).ready(function() {
    const targetElement = $('#villager-browser');
    const initialState = targetElement.data('initial-state');
    ReactDOM.render(<Browser id="browser" initialState={initialState}/>, targetElement[0]);
})