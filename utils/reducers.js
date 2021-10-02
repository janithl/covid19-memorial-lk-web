const filterInitialState = {
    page: 0,
    province: undefined,
    district: undefined,
    city: undefined,
    ageRange: undefined,
    gender: undefined,
};

const filterReducer = (state, action) => {
    switch (action.type) {
        case "RESET":
            return {
                ...filterInitialState
            };
        case "AGE":
            return {
                ...state,
                ageRange: action.value,
                page: 0
            }
        case "GENDER":
            return {
                ...state,
                gender: action.value,
                page: 0
            }
        case "PROVINCE":
            return {
                ...state,
                province: action.value,
                district: undefined,
                city: undefined,
                page: 0
            }
        case "DISTRICT":
            return {
                ...state,
                district: action.value,
                city: undefined,
                page: 0
            }
        case "CITY":
            return {
                ...state,
                city: action.value,
                page: 0
            }
        case "PAGE_UP":
            return {
                ...state,
                page: (state.page + 1)
            }
    }
}

export {
    filterInitialState, filterReducer
};