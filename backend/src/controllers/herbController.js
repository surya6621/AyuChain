const {
    createHerb,
    getHerbsByFarmer,
    findHerbById,
    updateHerbStatus
} = require("../models/herbModel");

const {
    addTrackingRecord,
    getTrackingHistory
} = require("../models/trackingModel");

const addHerb = async (req, res) => {
    try {
        const {
            name,
            description,
            origin
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Herb name is required"
            });
        }

        const herb = await createHerb(
            name,
            description || null,
            origin || null,
            req.user.id
        );

        res.status(201).json({
            message: "Herb registered successfully",
            herb
        });

    } catch (error) {
        console.error("Add herb error:", error);

        res.status(500).json({
            message: "Failed to register herb"
        });
    }
};

const getMyHerbs = async (req, res) => {
    try {
        const herbs = await getHerbsByFarmer(req.user.id);

        res.status(200).json({
            herbs
        });

    } catch (error) {
        console.error("Get herbs error:", error);

        res.status(500).json({
            message: "Failed to get herbs"
        });
    }
};

const getHerb = async (req, res) => {
    try {
        const herb = await findHerbById(req.params.id);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        res.status(200).json({
            herb
        });

    } catch (error) {
        console.error("Get herb error:", error);

        res.status(500).json({
            message: "Failed to get herb"
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const herb = await findHerbById(req.params.id);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        const updatedHerb = await updateHerbStatus(
            req.params.id,
            status
        );

        await addTrackingRecord(
            req.params.id,
            status,
            req.user.id
        );

        res.status(200).json({
            message: "Herb status updated successfully",
            herb: updatedHerb
        });

    } catch (error) {
        console.error("Update herb status error:", error);

        res.status(500).json({
            message: "Failed to update herb status"
        });
    }
};

const getHerbTracking = async (req, res) => {
    try {
        const herb = await findHerbById(req.params.id);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        const tracking = await getTrackingHistory(
            req.params.id
        );

        res.status(200).json({
            herb: {
                id: herb.id,
                name: herb.name,
                currentStatus: herb.status
            },
            tracking
        });

    } catch (error) {
        console.error("Get herb tracking error:", error);

        res.status(500).json({
            message: "Failed to get herb tracking history"
        });
    }
};

module.exports = {
    addHerb,
    getMyHerbs,
    getHerb,
    updateStatus,
    getHerbTracking
};
