import { json } from "@remix-run/react";

export const action = async ({ request, context }) => {
  const formData = await request.formData();
  const publicLid = formData.get('publicLid');
  const senderName = formData.get('senderName');
  const emailValue = formData.get('emailValue');
  const listId = formData.get('listId');

  let data;
  try {
    data = await context.swym.shareWishlistViaEmail(publicLid, senderName, emailValue);
    return json({ data, success: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

