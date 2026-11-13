const COUNTER_ID = "notes_category"

const nextCategoryId = async (categoryModel, counterModel) => {
    const highestCategory = await categoryModel.findOne().sort({ _id: -1 }).lean()
    const highestId = highestCategory?._id || 0

    try {
        await counterModel.updateOne(
            { _id: COUNTER_ID },
            { $max: { sequence: highestId } },
            { upsert: true }
        )
    } catch (error) {
        if (error.code !== 11000) {
            throw error
        }

        await counterModel.updateOne(
            { _id: COUNTER_ID },
            { $max: { sequence: highestId } }
        )
    }

    const counter = await counterModel.findOneAndUpdate(
        { _id: COUNTER_ID },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    )

    if (!Number.isSafeInteger(counter.sequence) || counter.sequence < 1) {
        throw new Error("Category ID sequence exceeded the supported range.")
    }

    return counter.sequence
}

module.exports = { nextCategoryId }
