const Advertisement = require("./advertisement.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addAdvertisement = async (req, res, next) => {
    try {
        const images = req.files?.images || [];
        const video = req.files?.video?.[0];
        const { link } = req.body;

        if (video && images.length) {
            return res.status(400).json({
                message: "Provide either images or a video, not both."
            });
        }

        if (video) {
            const ad = await Advertisement.create({
                video: video.filename,
            });
            await UserLog.create({
                userId: req.user.id,
                log: "Advertisement created",
                status: "Created",
                role: "admin",
                logo: "/assets/advertisement.webp",
                time: new Date()
            })
            return res.status(201).json({
                message: "Video advertisement added.",
                data: ad
            });
        }

        if (images.length) {
            if (!Array.isArray(link) || link.length !== images.length) {
                return res.status(400).json({
                    message: "Each image must have its own link."
                });
            }

            const ads = images.map((file, index) => ({
                image: file.filename,
                link: link[index]
            }));

            const ad = await Advertisement.create({
                ads,
            });
            await UserLog.create({
                userId: req.user.id,
                log: "Advertisement created",
                status: "Created",
                role: "admin",
                logo: "/assets/advertisement.webp",
                time: new Date()
            })

            return res.status(201).json({
                message: "Image advertisements added.",
                data: ad
            });
        }
        return res.status(400).json({
            message: "Provide images with links or a video."
        });

    } catch (err) {
        next(err);
    }
};

exports.updateAdvertisement = async (req, res, next) => {
    try {
        const { id, link } = req.body;
        const images = req.files?.images || [];
        const video = req.files?.video?.[0];

        if (!id) {
            return res.status(400).json({ message: "Advertisement ID is required." });
        }

        if (video && images.length) {
            return res.status(400).json({
                message: "Provide either images or a video, not both."
            });
        }

        let updateData = {};

        if (video) {
            updateData = {
                video: video.filename,
                ads: [],
            };
        } else if (images.length) {
            if (!Array.isArray(link) || link.length !== images.length) {
                return res.status(400).json({
                    message: "Each image must have its own link."
                });
            }
            updateData = {
                ads: images.map((file, index) => ({
                    image: file.filename,
                    link: link[index]
                })),
                video: null,
            };
        } else {
            return res.status(400).json({
                message: "Provide images with links or a video."
            });
        }

        const updatedAd = await Advertisement.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedAd) {
            return res.status(404).json({ message: "Advertisement not found." });
        }
        await UserLog.create({
            userId: req.user.id,
            log: "Advertisement updated",
            status: "Updated",
            role: "admin",
            logo: "/assets/advertisement.webp",
            time: new Date()
        })
        return res.status(200).json({
            message: "Advertisement updated successfully.",
            data: updatedAd
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteAds = async (req, res, next) => {
    try {
        const { id } = req.body;
        await Advertisement.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: "Advertisement deleted",
            status: "Deleted",
            role: "admin",
            logo: "/assets/advertisement.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Deleted Successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.statusChange = async (req, res, next) => {
    try {
        const { id, status } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Advertisement id is required."
            });
        }

        if (typeof status !== "boolean") {
            return res.status(400).json({
                message: "Status must be boolean."
            });
        }

        if (status === true) {
            const alreadyActive = await Advertisement.findOne({
                status: true,
                _id: { $ne: id }
            });

            if (alreadyActive) {
                return res.status(409).json({
                    message: "Another advertisement is already active. Deactivate it first."
                });
            }
        }

        const ad = await Advertisement.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!ad) {
            return res.status(404).json({
                message: "Advertisement not found."
            });
        }
        await UserLog.create({
            userId: req.user.id,
            log: "Advertisement Status Changed",
            status: "Status",
            role: "admin",
            logo: "/assets/advertisement.webp",
            time: new Date()
        })
        res.json({
            message: "Advertisement status updated successfully.",
            data: ad
        });

    } catch (err) {
        next(err);
    }
}

exports.listForAdmin = async (req, res, next) => {
    try {
        const listData = await Advertisement.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
    }
}

exports.listForClient = async (req, res, next) => {
    try {
        const listData = await Advertisement.find({ status: true }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
    }
}