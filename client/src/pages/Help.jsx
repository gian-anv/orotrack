import { Link } from "react-router";
import Logo from "../components/Logo.jsx";

const SAMPLE = `timestamp,exercise,result,confidence_score,input_validity
2026-09-18 09:12:04,/r/ initial,correct,0.91,valid
2026-09-18 09:12:31,/r/ initial,incorrect,0.64,valid
2026-09-18 09:13:02,/r/ initial,,0.12,low_input`;

export default function Help() {
  return (
    <div className="help">
      <div className="help-top">
        <Logo />
        <Link to="/">Back to Orotrack</Link>
      </div>

      <h1>How Orotrack works</h1>
      <p>
        Orotrack is for speech-language pathologists who work with children on articulation. A child
        practises target sounds on a device, the device exports a CSV file after each session, and the
        therapist uploads that file here to review every attempt.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>Accounts are created by the administrator. There is no sign-up form.</li>
        <li>If you forget your password, ask the administrator to reset it.</li>
        <li>The administrator manages accounts only and cannot see anyone's participants or results.</li>
        <li>Each account sees only its own participants, uploads, and attempts.</li>
      </ul>

      <h2>Participants</h2>
      <ul>
        <li>Each child is stored as a code, such as PT-0142. Never enter a child's name.</li>
        <li>A code can only be used once across all accounts.</li>
        <li>The code and age group are required. Target sounds are optional.</li>
        <li>Deleting a participant also deletes their uploads and attempts.</li>
      </ul>

      <h2>The CSV format</h2>
      <p>One file is one practice session for one participant. The first line must be exactly:</p>
      <pre>{SAMPLE}</pre>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>What it holds</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>timestamp</td><td>Date and time of the attempt, as YYYY-MM-DD HH:MM:SS</td></tr>
          <tr><td>exercise</td><td>The sound and its position in the word, such as /r/ initial</td></tr>
          <tr><td>result</td><td>correct or incorrect, or empty when the attempt was invalid</td></tr>
          <tr><td>confidence_score</td><td>How sure the device was, from 0 to 1</td></tr>
          <tr><td>input_validity</td><td>valid, low_input, or no_speech</td></tr>
        </tbody>
      </table>
      <ul>
        <li>Values cannot contain commas or quotation marks.</li>
        <li>Files can be up to 10 MB.</li>
        <li>Don't re-save the file in Excel. Its CSV option adds a hidden marker that breaks the header.</li>
      </ul>

      <h2>Uploading</h2>
      <p>
        On the Upload page, choose the participant, choose the file, and press Upload. The page shows
        how many attempts were saved. If the file is rejected, the message says why, for example
        "Missing column: confidence_score". Uploading the same file twice saves its attempts twice.
      </p>

      <h2>Attempts</h2>
      <p>
        Every attempt from your uploads, newest first. Filter by participant, exercise, input validity,
        or a date range, and press Reset to clear the filters. Invalid attempts are highlighted and
        show a dash for the result.
      </p>

      <h2>Trends</h2>
      <ul>
        <li><b>Sessions logged</b> is the number of files uploaded for the participant.</li>
        <li><b>Average score</b> is the percentage of valid attempts that were correct.</li>
        <li><b>Invalid input rate</b> is the percentage of all attempts the device could not judge.</li>
        <li>
          Each point on the chart is one day's average for one exercise. A line needs sessions on at
          least two different days.
        </li>
        <li>Choosing a single exercise updates both the numbers and the chart.</li>
      </ul>
    </div>
  );
}
