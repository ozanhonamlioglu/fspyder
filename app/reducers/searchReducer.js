
export default (state = [], action) => {
    switch (action.type) {
        case "SEARCH_HISTORY_FULFILLED":
            state = [
                ...state,
                action.payload,
            ]
            break;

        case "LOAD_HISTORY":
            state = [
                ...state,
                action.payload
            ]
            break
    
        default:
            break;
    }

    return state

}