const express = require("express");
const app = express();

const cors = require('cors');
const body = require("body-parser");
const database = require("./lib/config/database");
const device = require("express-device");
const countryRoutes = require("./routes/country/country.routes");
const companyRoutes = require("./routes/companies/companies.routes");
const adminRoutes = require('./routes/admin/admin.routes');
const planRoutes = require('./routes/plan/plan.routes');
const dashboardRoutes = require('./routes/dashboard/dashboard.routes');
const creatordRoutes = require('./routes/creator/creator.routes');
const learnerRoutes = require('./routes/learner/learner.routes');
const cohortsRoutes = require('./routes/cohorts/cohorts.routes')
const gameAssignRoutes = require('./routes/gameassigned/gameassigned.routes');
const categoryRoutes = require('./routes/category/category.routes');
const remainderRoutes = require('./routes/remainder/remainder.routes');
const questionRoutes = require('./routes/question/question.routes');
const questionOptionRoutes = require('./routes/questionoption/questionoption.routes');
const animationRoute = require('./routes/animation/animation.routes');
const gameRoutes = require('./routes/game/game.routes'); 
const industryRoutes = require('./routes/industry/industry.routes');
const planvalidityRoutes = require('./routes/planvaliditylogs/planvaliditylogs.routes')
const { authenticateUser } = require("./lib/authentication/authorization");
const geoLocationRoute = require("./lib/geolocation/geolocation");
const subscription = require("./routes/plansubscription/plansubscription.routes")
const skillsRoutes = require('./routes/skills/skills.routes')
const gameReviewRoutes = require('./routes/gamereview/gamereview.routes')
const scormRoute = require('./routes/scorm/scorm.routes')
const translateRoutes = require('./routes/translate/translate.routes')
const languageRoutes = require('./routes/languages/languages.routes')
const previewlogsRoutes = require('./routes/previewlogs/previewlogs.routes')
const activityRoutes=require('./routes/activityroutes/activity.routes')
const gameProfile = require('./gameApplication/routes/profile.routes')
const gamePlay = require('./gameApplication/routes/gameplay.routes')
const gameActivity = require('./gameApplication/routes/gameActivity.routes')
const ReflectionAnswer =require('./gameApplication/routes/gameReflectionAnswer.routes')


const cron =require("node-cron");
require("dotenv").config();

app.use(cors());
app.use('/uploads',express.static('uploads'));
app.use(body.json());
app.use(body.urlencoded({ extended: false }));
app.use(device.capture());
app.use(authenticateUser);
app.use('/country', countryRoutes);
app.use('/companies', companyRoutes);
app.use('/admin',adminRoutes);
app.use("/plan", planRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/creator", creatordRoutes);
app.use("/learner",learnerRoutes);
// app.use("/game",gameRoutes);
app.use("/cohorts",cohortsRoutes);
app.use("/game",gameRoutes);
// app.use("/cohorts",cohortsRoutes);
app.use('/mail', remainderRoutes);
app.use('/gameassign',gameAssignRoutes);
app.use('/gamereview',gameReviewRoutes);
app.use('/category',categoryRoutes);
app.use('/question',questionRoutes);
app.use('/animation',animationRoute);
app.use('/questionOption',questionOptionRoutes);
app.use('/industry',industryRoutes);
app.use('/planvalidity',planvalidityRoutes);
app.use('/getLocation',geoLocationRoute);
app.use('/subscription',subscription)
app.use('/skills',skillsRoutes);
app.use('/translate',translateRoutes);
app.use('/languages',languageRoutes);
app.use('/gamereview',gameReviewRoutes);
app.use('/scorm',scormRoute);
app.use('/preview',previewlogsRoutes);
app.use('/activity',activityRoutes);

/*******************Game Application********************************/
app.use('/gameUser',gameProfile);
app.use('/gameplay',gamePlay);
app.use('/activity',gameActivity);
app.use('/reflectionquestion',ReflectionAnswer);


app.listen(process.env.PORT || 5556,'192.168.1.45', (err) => {
  if (err) throw err;
  else console.log(`port ${process.env.PORT || 5556} is Run`);

  // cron.schedule('*/3 * * * * *', () => {
  //   fetch(`http://192.168.1.51:${process.env.PORT || 5555}/mail/remainder`)
  //     .then(response => console.log('Reminder sent'))
  //     .catch(err => console.error('Error sending reminder:', err));
  // });
});
