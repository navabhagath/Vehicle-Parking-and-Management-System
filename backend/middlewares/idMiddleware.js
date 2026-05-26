export const updateId = async (model) => {
    // Check if model is a valid array and has length
    if (Array.isArray(model) && model.length > 0) {
        
        return model.map(item => {
            // Destructure _id and rename to id, collect everything else in ...rest
            const { _id: id, ...rest } = item;
            
            return { id, ...rest };
        });

    } else {
        return null;
    }
};