import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

import searchState from "./reducers/searchReducer.js";
import searchPublicState from "./reducers/publicSearchReducer.js";
import pageState from "./reducers/pageHistoryReducer.js";
import settingsState from "./reducers/settingsReducer.js";

export default createStore(
    combineReducers({
        searchState,
        searchPublicState,
        pageState,
        settingsState
    }),
    {},
    applyMiddleware(
        logger,
        thunk,
        promise())
);
