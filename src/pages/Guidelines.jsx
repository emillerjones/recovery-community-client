import "./Guidelines.css";

export default function Guidelines() {
  return (
    <div className="guidelines">
      <h1 className="guidelines__title">Guidelines</h1>
      <p className="guidelines__intro">
        All members must agree to follow these guidelines and acknowledge the
        disclaimer below:
      </p>

      <ol className="guidelines__list">
        <li>
          <strong>Confidentiality:</strong> All information shared in the
          group should remain confidential and is not to leave the group.
          Privacy is of the highest importance. (Familiarize yourself with
          the privacy settings of Facebook Groups. Please understand that
          there is always slight risk when sharing information online.)
        </li>
        <li>
          <strong>No Illegal Activity:</strong> You may not use our service
          for any unlawful purposes. We do not endorse going against your
          current local laws regarding substance use or possession. We are
          not here to tell you how to break or circumvent the law or advise
          you on how to pass a drug test. Posts asking about the chances of
          getting caught or likelihood of success in a criminal act are not
          allowed. Do not post information on how to smuggle, ship, hide,
          manufacture, or distribute illegal substances.
        </li>
        <li>
          <strong>Acceptance:</strong> The group accepts members just as
          they are and remains non-judgmental at all times. We remain
          open-minded and kind to all.
        </li>
        <li>
          <strong>Stay On Topic:</strong> We discuss things related only to
          cannabis, substance dependence/addiction and recovery. We refrain
          from topics that are political or religious in nature.
        </li>
        <li>
          <strong>Sharing:</strong> Focus on the person sharing and do not
          offer unsolicited advice.
          <div className="guidelines__sublist">
            <strong>Meme Sharing Rules:</strong> The definition of a meme is
            as follows: a humorous image, video, piece of text, etc. that is
            copied (often with slight variations). All memes must be within
            our guidelines and on topic.
          </div>
        </li>
        <li>
          <strong>No Spamming, Advertisements, Trolling:</strong> Spam, or
          the repetitive display of the same text again and again, is not
          allowed. Advertising for the purpose of selling, soliciting or
          promoting something is also prohibited. Trolling, defined as a
          deliberately offensive or provocative online posting with the aim
          of upsetting someone or eliciting an angry response, is forbidden.
        </li>
        <li>
          <strong>Admins/Moderators:</strong> The admins/moderators are here
          to lead the group and facilitate the discussion. They reserve the
          right to remove any post/comment at any time. They also reserve
          the right to deny/block membership due to noncompliance with these
          guidelines. Please respect that the admins/moderators are generous
          volunteers and are not paid professionals.
        </li>
      </ol>

      <p className="guidelines__contact">
        Please contact our founder, Ruth, for any questions, concerns, or
        kudos.
      </p>

      <p className="guidelines__disclaimer">
        <strong>Disclaimer:</strong> Recovery With The Exit Drug is a
        volunteer support group sharing practical information. This is not a
        professional or medical organization. The information provided in
        this group is for informational and educational purposes only and is
        not a substitute for professional care.
      </p>
    </div>
  );
}
