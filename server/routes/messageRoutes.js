const express = require("express");

const router =
  express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const {
  sendMessage,
  getMessages,
  markMessagesSeen,
  getUnreadCounts,
  deleteMessage,
  editMessage,
  reactToMessage,
  forwardMessage,
} = require("../controllers/messageController");


/* =====================================================
   SEND MESSAGE
===================================================== */

router.post(
  "/",
  protect,
  upload.single("image"),
  sendMessage
);


/* =====================================================
   UNREAD COUNTS
===================================================== */

router.get(
  "/unread/counts",
  protect,
  getUnreadCounts
);


/* =====================================================
   MARK SEEN
===================================================== */

router.put(
  "/seen/:conversationId",
  protect,
  markMessagesSeen
);


/* =====================================================
   EDIT MESSAGE
===================================================== */

router.put(
  "/edit/:messageId",
  protect,
  editMessage
);


/* =====================================================
   REACT TO MESSAGE
===================================================== */

router.post(
  "/react/:messageId",
  protect,
  reactToMessage
);
/* =====================================================
   FORWARD MESSAGE
===================================================== */
router.post(
  "/forward/:messageId",
  protect,
  forwardMessage
);

/* =====================================================
   DELETE MESSAGE
===================================================== */

router.delete(
  "/:messageId",
  protect,
  deleteMessage
);


/* =====================================================
   GET MESSAGES
===================================================== */

router.get(
  "/:conversationId",
  protect,
  getMessages
);


module.exports = router;