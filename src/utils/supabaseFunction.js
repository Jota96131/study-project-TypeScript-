import { supabase } from "./supabaseClient";

export const getAllHistory = async () => {
  const { data, error } = await supabase.from("study-record").select("*");

  if (error) {
    console.error("取得失敗:", error.message);
    return null;
  }
  return data;
};

export const addTodo = async (title, time) => {
  const { data, error } = await supabase
    .from("study-record")
    .insert([{ title, time: Number(time) }])
    .select();

  if (error) {
    console.log("データ追加エラー", error);
    return null;
  }
  return data[0];
};

export const deleteTodo = async (id) => {
  const result = await supabase.from("study-record").delete().eq("id", id);

  return result.error;
};
