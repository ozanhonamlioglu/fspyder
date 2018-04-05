
export default (state=[], action) => {

    switch (action.type) {
        case "UPDATE_PAGE_HISTORY":
            state = [
                ...state,
                action.payload
            ]
            break;
    
        default:
            break;
    }

    return state

}