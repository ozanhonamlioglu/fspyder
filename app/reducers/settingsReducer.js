
export default (state={}, action) => {

    switch (action.type) {
        case "LOAD_PROXY":
            state.proxy = action.payload
            break;

        case "LOAD_CRED":
            state.credentials = action.payload
            break;
    
        default:
            break;
    }

    return state

}