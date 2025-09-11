const {
  user: userModel,
  division: divisionModel,
  location: locationModel,
  company: companyModel,
  user_status: userStatusModel,
  privilege: privilegeModel,
} = require("../models");
const argon = require("argon2");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const CustomHttpError = require("../utils/custom_http_error.js");

const register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone_number,
    division_uuid,
    location_uuid,
    company_uuid,
  } = req.body;

  console.log(req.body);

  if (!name || !email || !password) {
    throw new CustomHttpError("value cannot be null", 400);
  }

  const find_email = await userModel.findOne({
    where: {
      email,
    },
  });

  if (find_email !== null) {
    throw new CustomHttpError("email already registered", 409);
  }

  let division_id = null;

  if (division_uuid) {
    const find_division = await divisionModel.findOne({
      where: {
        uuid: division_uuid,
      },
    });

    if (find_division === null) {
      throw new CustomHttpError("division not found", 404);
    } else {
      division_id = find_division.id;
    }
  }

  let location_id = null;

  if (location_uuid) {
    const find_location = await locationModel.findOne({
      where: {
        uuid: location_uuid,
      },
    });

    if (find_location === null) {
      throw new CustomHttpError("location not found", 404);
    } else {
      location_id = find_location.id;
    }
  }

  let company_id = null;

  if (company_uuid) {
    const find_company = await companyModel.findOne({
      where: {
        uuid: company_uuid,
      },
    });

    if (find_company === null) {
      throw new CustomHttpError("company not found", 404);
    } else {
      company_id = find_company.id;
    }
  }

  const has_password = await argon.hash(password);

  const register = await userModel.create({
    name,
    email,
    password: has_password,
    phone_number,
    location_id,
    division_id,
    company_id,
    user_status_id: 1,
  });

  const user = await userModel.findOne({
    where: {
      uuid: register.uuid,
    },
    attributes: {
      exclude: ["id", "password"],
    },
  });

  return res.status(201).json({
    success: true,
    message: "success register",
    data: {
      user,
    },
  });
};

const registerAttribute = async (req, res) => {
  const company = await companyModel.findAll();
  const location = await locationModel.findAll();
  const division = await divisionModel.findAll();

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      company,
      location,
      division,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomHttpError("email and password cannot be null", 400);
  }

  const findUser = await userModel.findOne({
    where: {
      email,
    },
    include: [
      {
        model: userStatusModel,
        attributes: ["name", "code"],
      },
    ],
  });

  if (!findUser) {
    throw new Error("user not found");
  }

  if (findUser.user_status.code !== "2") {
    throw new CustomHttpError(
      `you don't have access, status account is ${findUser.user_status.name}, not active`,
      403
    );
  }

  const match = await argon.verify(findUser.password, password);

  if (!match) {
    throw new CustomHttpError(`email or password is incorrect`, 401);
  }

  const token = jwt.sign(
    {
      uuid: findUser.uuid,
      name: findUser.name,
      email: findUser.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  req.session.token = token;

  return res.status(200).json({
    success: true,
    message: "login success",
    data: {
      token,
    },
  });
};

const getMe = async (req, res) => {
  const user = await userModel.findOne({
    where: {
      uuid: req.user.uuid,
    },
    include: [
      {
        model: locationModel,
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: divisionModel,
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: userStatusModel,
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: companyModel,
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: privilegeModel,
        attributes: {
          exclude: ["id"],
        },
      },
    ],
    attributes: {
      exclude: ["id", "password"],
    },
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      user,
    },
  });
};

const sendEmailReset = async (req, res) => {
  const { email } = req.body;

  const result = await userModel.findOne({
    where: {
      email,
    },
    include: [
      {
        model: userStatusModel,
        attributes: ["name"],
      },
    ],
  });

  if (!result) {
    throw new CustomHttpError("user not found", 404);
  }

  const token = jwt.sign({ uuid: result.uuid }, process.env.JWT_SECRET, {
    expiresIn: "60m",
  });

  const link = `${process.env.LINK_FRONTEND}/reset/${token}`;

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const emailMessage = {
    from: '"Kopkarla" <no-replay@kopkarla.co.id>',
    to: email,
    subject: "Reset Password",
    html: `<p>click this link for reset your password <a href="${link}">Reset Password</a></p>`,
  };

  await transporter.sendMail(emailMessage);

  return res.status(200).json({
    success: true,
    message: "success, check your email for reset password",
  });
};

const getTokenReset = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new CustomHttpError("token not found", 404);
  }

  //validation token
  const verify = jwt.verify(token, process.env.JWT_SECRET);

  const user = await userModel.findOne({
    where: {
      uuid: verify.uuid,
    },
    attributes: {
      exclude: ["id", "password"],
    },
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      user,
    },
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, conf_password } = req.body;

  if (!token || token === null) {
    throw new CustomHttpError("token not found", 404);
  }

  if (password !== conf_password) {
    throw new CustomHttpError("password not match, please check again", 401);
  }

  const verify = jwt.verify(token, process.env.JWT_SECRET);

  const user = await userModel.findOne({
    where: {
      uuid: verify.uuid,
    },
  });

  const hasPassword = await argon.hash(password);

  await user.update({
    password: hasPassword,
  });

  return res.status(201).json({
    success: true,
    message: "reset password successed",
  });
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new CustomHttpError(err.message, 400);

    return res.status(200).json({
      success: true,
      message: "logout success",
    });
  });
};

module.exports = {
  register,
  registerAttribute,
  login,
  getMe,
  sendEmailReset,
  getTokenReset,
  resetPassword,
  logout,
};
