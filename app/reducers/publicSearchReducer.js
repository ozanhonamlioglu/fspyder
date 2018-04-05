

export default (state = [], action) => {
    switch (action.type) {

        case "LOAD_PUBLIC_HISTORY":
            state = [
                ...state,
                action.payload
            ]
            break
    
        default:
            break;
    }

    console.log(state)
    return state

}