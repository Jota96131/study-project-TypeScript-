import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import App from "../App";
import * as recordService from "../services/recordService";
import { Record } from "../domain/record";

// supabaseClientのモック化（import.meta.envがJestで使えないため）
jest.mock("../supabaseClient", () => ({
  supabase: {},
}));

// recordServiceのモック化
// モックとは：本物のSupabase通信の代わりに「偽物の関数」を使うこと
// これによりテスト時にDB接続なしで動作確認できる
jest.mock("../services/recordService");

const mockFetchRecords = recordService.fetchRecords as jest.MockedFunction<typeof recordService.fetchRecords>;
const mockAddRecord = recordService.addRecord as jest.MockedFunction<typeof recordService.addRecord>;
const mockDeleteRecord = recordService.deleteRecord as jest.MockedFunction<typeof recordService.deleteRecord>;
const mockUpdateRecord = recordService.updateRecord as jest.MockedFunction<typeof recordService.updateRecord>;

const mockRecords: Record[] = [
  new Record("1", "TypeScript", "3"),
  new Record("2", "React", "2"),
];

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchRecords.mockResolvedValue(mockRecords);
  mockAddRecord.mockResolvedValue();
  mockDeleteRecord.mockResolvedValue();
  mockUpdateRecord.mockResolvedValue();
});

describe("ローディング画面", () => {
  it("データ取得中にローディングが表示される", () => {
    // fetchRecordsが解決しないPromiseを返す → ずっとローディング状態
    mockFetchRecords.mockReturnValue(new Promise(() => {}));
    renderApp();
    expect(screen.getByText("学習記録アプリ")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("テーブル表示", () => {
  it("データ取得後にテーブルが表示される", async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("タイトル", () => {
  it("タイトルが表示される", async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText("学習記録アプリ")).toBeInTheDocument();
    });
  });
});

describe("新規登録ボタン", () => {
  it("新規登録ボタンが表示される", async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "新規登録" })).toBeInTheDocument();
    });
  });
});

describe("登録モーダル", () => {
  it("新規登録ボタンを押すとモーダルが表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));

    expect(screen.getByText("学習記録の登録")).toBeInTheDocument();
  });

  it("モーダルのタイトルが「学習記録の登録」である", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("学習記録の登録")).toBeInTheDocument();
  });
});

describe("登録機能", () => {
  it("すべての項目を入力して登録できる", async () => {
    const user = userEvent.setup();
    mockFetchRecords
      .mockResolvedValueOnce(mockRecords)
      .mockResolvedValueOnce([...mockRecords, new Record("3", "Next.js", "5")]);

    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: TypeScript"), "Next.js");
    await user.type(screen.getByPlaceholderText("例: 2"), "5");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(mockAddRecord).toHaveBeenCalledWith("Next.js", "5");
    });
  });

  it("登録後にモーダルが閉じる", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: TypeScript"), "Vue");
    await user.type(screen.getByPlaceholderText("例: 2"), "1");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("登録後に再度モーダルを開いても前の入力内容が残っていない", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // 1回目の登録
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: TypeScript"), "Vue");
    await user.type(screen.getByPlaceholderText("例: 2"), "1");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 再度開く
    await user.click(screen.getByRole("button", { name: "新規登録" }));

    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("");
    expect(screen.getByPlaceholderText("例: 2")).toHaveValue(null);
  });
});

describe("バリデーション", () => {
  it("学習内容が未入力で登録するとエラーが表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: 2"), "1");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.getByText("内容の入力は必須です")).toBeInTheDocument();
    });
  });

  it("学習時間が未入力で登録するとエラーが表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: TypeScript"), "React");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.getByText("時間の入力は必須です")).toBeInTheDocument();
    });
  });

  it("学習時間に0未満の値を入力するとエラーが表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByPlaceholderText("例: TypeScript"), "React");
    await user.type(screen.getByPlaceholderText("例: 2"), "-1");
    await user.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.getByText("時間は0以上である必要があります")).toBeInTheDocument();
    });
  });
});

describe("削除機能", () => {
  it("削除ボタンを押すと削除される", async () => {
    const user = userEvent.setup();
    mockFetchRecords
      .mockResolvedValueOnce(mockRecords)
      .mockResolvedValueOnce([mockRecords[1]]);

    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // テーブルの最初の行の削除ボタン（各行の2番目のボタン）をクリック
    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1]; // thead以外の最初の行
    const buttons = firstDataRow.querySelectorAll("button");
    await user.click(buttons[1]); // 2番目のボタンが削除ボタン

    await waitFor(() => {
      expect(mockDeleteRecord).toHaveBeenCalledWith("1");
    });
  });
});

describe("編集機能", () => {
  const getEditButtons = () => {
    // tbody内の各行から最初のボタン（編集ボタン）を取得
    const tbody = screen.getByRole("table").querySelector("tbody")!;
    const rows = tbody.querySelectorAll("tr");
    return Array.from(rows).map((row) => {
      const buttons = row.querySelectorAll("button");
      return buttons[0] as HTMLElement; // 最初のボタンが編集ボタン
    });
  };

  it("編集ボタンがそれぞれの記録ごとに表示されている", async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    expect(editButtons).toHaveLength(2);
  });

  it("編集ボタンを押すとモーダルが表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("モーダルのタイトルが「記録編集」である", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);

    expect(screen.getByText("記録編集")).toBeInTheDocument();
  });

  it("編集ボタンを押すと該当する記録の内容がフォームに表示される", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);

    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("TypeScript");
    expect(screen.getByPlaceholderText("例: 2")).toHaveValue(3);
  });

  it("別の編集ボタンを押すとその記録の内容に切り替わる", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    // 1つ目の編集ボタンを押す
    await user.click(editButtons[0]);
    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("TypeScript");

    // モーダルを閉じる
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 2つ目の編集ボタンを押す
    const editButtons2 = getEditButtons();
    await user.click(editButtons2[1]);
    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("React");
    expect(screen.getByPlaceholderText("例: 2")).toHaveValue(2);
  });

  it("編集後に新規登録を開くとフォームが空になる", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // 編集ボタンを押す
    const editButtons = getEditButtons();
    await user.click(editButtons[0]);
    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("TypeScript");

    // モーダルを閉じる
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 新規登録を押す
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("");
    expect(screen.getByPlaceholderText("例: 2")).toHaveValue(null);
  });

  it("編集して保存すると更新される", async () => {
    const user = userEvent.setup();
    mockFetchRecords
      .mockResolvedValueOnce(mockRecords)
      .mockResolvedValueOnce([
        new Record("1", "TypeScript入門", "5"),
        mockRecords[1],
      ]);

    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);

    const titleInput = screen.getByPlaceholderText("例: TypeScript");
    const timeInput = screen.getByPlaceholderText("例: 2");

    await user.clear(titleInput);
    await user.type(titleInput, "TypeScript入門");
    await user.clear(timeInput);
    await user.type(timeInput, "5");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(mockUpdateRecord).toHaveBeenCalledWith("1", "TypeScript入門", "5");
    });

    await waitFor(() => {
      expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
    });
  });

  it("保存を押すとモーダルが閉じる", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("キャンセルを押すとモーダルが閉じる", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const editButtons = getEditButtons();
    await user.click(editButtons[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("保存後に再度モーダルを開くとフォームがクリアされている", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // 編集して保存
    const editButtons = getEditButtons();
    await user.click(editButtons[0]);
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 新規登録を開く
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    expect(screen.getByPlaceholderText("例: TypeScript")).toHaveValue("");
    expect(screen.getByPlaceholderText("例: 2")).toHaveValue(null);
  });
});
