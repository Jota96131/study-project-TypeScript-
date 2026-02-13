import { supabase } from "../supabaseClient";
import { Record } from "../domain/record";

export const addRecord = async (title: string, time: string): Promise<void> => {
  const { error } = await supabase.from("study-record").insert({ title, time });
  if (error) throw error;
};

export const deleteRecord = async (id: string): Promise<void> => {
  const { error } = await supabase.from("study-record").delete().eq("id", id);
  if (error) throw error;
};

export const updateRecord = async (id: string, title: string, time: string): Promise<void> => {
  const { error } = await supabase.from("study-record").update({ title, time }).eq("id", id);
  if (error) throw error;
};

export const fetchRecords = async (): Promise<Record[]> => {
  const { data, error } = await supabase.from("study-record").select("*");
  if (error) throw error;

  return (data || []).map(
    (item: any) => new Record(item.id, item.title, item.time),
  );
};
