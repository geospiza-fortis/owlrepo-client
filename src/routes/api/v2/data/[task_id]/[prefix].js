const BUCKET = process.env.PROJECT_ID;

export async function get(req, res, next) {
  const { task_id, prefix } = req.params;
  res.redirect(
    `https://storage.googleapis.com/${BUCKET}/v1/uploads/${task_id}/${prefix}`
  );
}
