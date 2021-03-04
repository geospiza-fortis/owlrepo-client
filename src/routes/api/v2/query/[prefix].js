const BUCKET = process.env.PROJECT_ID;

export async function get(req, res, next) {
  const { prefix } = req.params;
  res.redirect(
    `https://storage.googleapis.com/${BUCKET}/v1/queries/${prefix}.json`
  );
}
