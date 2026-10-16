import { Link } from 'react-router-dom';
const ORG = import.meta.env.VITE_ORG_NAME || 'the administrators of this site';
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const Contact = () => <p>{EMAIL ? <>You can contact us at <a href={'mailto:' + EMAIL}>{EMAIL}</a>.</> : 'Please direct questions to the site administrators.'}</p>;
const Shell = ({ title, children }) => <main className="doc"><h2>{title}</h2><p className="muted">Last updated: 11 October 2026</p>{children}<p><Link to="/">Back to the site</Link></p></main>;
export function Privacy() {
  return <Shell title="Privacy Policy">
    <p>This policy explains what {ORG} collects when you use this online test platform and how it is used.</p>
    <h3>Information we collect</h3>
    <p>Account details: your name, email address and a password, which is stored only as a one-way hash. Test activity: your answers, any pictures you upload as answers, start and submit times, marks and the feedback written by an administrator.</p>
    <h3>How we use it</h3>
    <p>To let you sign in, take assigned tests, mark your work, show your results, and produce score reports. We do not sell your information and we do not use advertising or analytics trackers.</p>
    <h3>Who can see it</h3>
    <p>You can see your own submissions and published results. Administrators can see accounts, submissions, uploaded pictures and results for the tests they manage.</p>
    <h3>Data stored in your browser</h3>
    <p>The site stores your sign-in token and your light or dark theme choice in your browser's local storage. No tracking cookies are set.</p>
    <h3>Retention and deletion</h3>
    <p>Data is kept while your account exists. An administrator can delete your account, which also deletes your submissions and results. Ask the administrators if you want your data deleted or corrected.</p>
    <h3>Security</h3>
    <p>Passwords are hashed and access to administrator functions is restricted by role. No system is completely secure, so use a password you do not use elsewhere.</p>
    <h3>Changes and contact</h3>
    <p>We may update this policy and will change the date above when we do.</p><Contact />
  </Shell>;
}
export function Terms() {
  return <Shell title="Terms and Conditions">
    <p>By creating an account or taking a test on this platform you agree to these terms with {ORG}.</p>
    <h3>Accounts</h3>
    <p>Keep your sign-in details private and provide accurate information. You are responsible for activity under your account.</p>
    <h3>Taking tests</h3>
    <p>Complete each test yourself without help from other people or unauthorised material unless the test says otherwise. Each test can normally be attempted once, and answers are submitted automatically when the timer ends.</p>
    <h3>Your content</h3>
    <p>Pictures and text you submit must be your own work and must not be unlawful or offensive. Administrators can view and delete submissions.</p>
    <h3>Results</h3>
    <p>Marks are decided by automatic grading and by administrators. Results become visible only after an administrator publishes them.</p>
    <h3>Availability and liability</h3>
    <p>The service is provided as is. We try to keep it available but cannot guarantee uninterrupted access, and to the extent the law allows we are not liable for losses caused by downtime or data loss.</p>
    <h3>Changes and contact</h3>
    <p>We may update these terms and will change the date above when we do. Continued use means you accept the updated terms.</p><Contact />
  </Shell>;
}