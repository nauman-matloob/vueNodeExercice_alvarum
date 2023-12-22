import { Router } from "express";
const router = Router();
import settings from "../../util/settings.js";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Code from "../../models/Code.js";
import Event from "../../models/Event.js";
import { v4 as uuid } from "uuid";
import { sendSMS } from "../../util/sms.js";
import $t from "../../util/i18n.js";
import { Op } from "sequelize";
import { randomCode } from "../../util/functions.js";

router.post("/sendCode", async (req, res) => {
  if (!req) return res.json(false);

  let phone_number = req.body.phone.replace(/ /g, "");

  let user = await User.findOne({
    where: { phone_number },
  });

  if (user) {
    let new_code = randomCode(6);
    await Code.create({
      id: uuid(),
      code: new_code,
      user_id: user.id,
    });

    let message = new_code + $t("sms.code", req.header("Content-Language"));
    sendSMS(phone_number, message);

    return res.json(true);
  }

  return res.json(false);
});

router.post("/loginWithCode", async (req, res) => {
  let code = await Code.findOne({
    where: {
      code: req.body.code,
    },
    include: [
      {
        model: User,
        where: { phone_number: req.body.phone.replace(/ /g, "") },
        include: [{ model: Event }],
      },
    ],
  });

  if (code && code.User) {
    return res.json(getToken(code.User));
  }
  return res.json(false);
});

router.post("/checkLastName", async (req, res) => {
  if (!req) return res.json(false);

  let last_name = req.body.lastname.replace(/ /g, "").toLowerCase();

  let user = await User.findOne({
    where: { 
      last_name: {
        [Op.like]: '%' + last_name + '%'
      }
     },
  });

  if (user) {
    console.log('DEV: your registration id is :', user.registration_id)
    return res.json(true);
  }

  return res.json(false);
});

router.post("/loginWithRegisterId", async (req, res) => {
  let user = await User.findOne({
    where: {
      registration_id: req.body.registerid,
    },
  });

  if (user) {
    return res.json(getToken(user));
  }
  return res.json(false);
});


router.get("/me", async (req, res) => {
  if (!req["user"]?.id) {
    return res.json(null);
  }
  const user = await User.findByPk(req["user"].id, {
    include: [{ model: Event }],
  });
  res.json(user);
  user.last_connected = new Date();
  await user.save();
});

function getToken(user) {
  let accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    settings.jwt.secret,
    {
      expiresIn: settings.jwt.expiresIn,
    }
  );

  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: settings.jwt.expiresIn,
  };
}

export default router;
