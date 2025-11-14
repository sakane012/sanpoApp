# 🌐 Webアプリケーション開発ポートフォリオ（Java / JSP / Servlet）

## 📘 概要
Java / JSP / Servlet / SQL を用いて開発した Web アプリケーションです。  


---

## 🛠 開発環境
| 項目 | 内容 |
|------|------|
| 言語 | Java（JDK 17 など） |
| フレームワーク | Servlet / JSP（Jakarta EE）/ javaScript |
| データベース | H2DB |
| ビルドツール |  Eclipse Dynamic Web Project |
| アプリケーションサーバー | Apache Tomcat 10.x |
| IDE | Eclipse / VS Code |
| バージョン管理 | Git / GitHub |
| OS | Windows |

---

## 🧩 機能一覧
| カテゴリ | 内容 |
|------------|------|
| ログイン機能 | 新規登録・ログイン・ログアウト|
| 現在地取得機能 | GoogleAPIで現在地を取得し、フォームに自動入力 |
| 出発地お気に入り登録機能 | DBに格納、取得 |
| ルート生成機能 |ユーザーの現在地、歩行時間 or 歩行距離の条件を元にランダムなルート生成 |

---

## 📂 ディレクトリ構成（例）
```
sanpoApp/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── model/
│   │   │   │   └── FavoriteAddress.java
│   │   │   ├── dao/
│   │   │   │   ├── FavotireDao.java
│   │   │   │   └── UserDAO.java
│   │   │   └── servlet/
│   │   │       ├── LoginServlet.java
│   │   │       ├── LogoutServlet.java
│   │   │       ├── RegisterRouteServlet.java
│   │   │       ├── ResultServlet.java
│   │   │       ├── SignServlet.java
│   │   │       └── WelcomeServlet.java
│   │   └── webapp/
│   │       ├── jsp
│   │       │   ├── index.jsp
│   │       │   ├── login.jsp
│   │       │   ├── logout.jsp
│   │       │   └── search.jsp
│   │       └── WEB-INF/
│   │           ├── header.jsp
│   │           ├── footer.jsp
│   │           ├── welcome.jsp
│   │           └── result.jsp
│   └── test/
└── README.md

---

## 🗄 データベース構成
### 📘 ER図
> 画像を `docs/er_diagram.png` に差し替えてください。
> 例：  
> ![ER図](./docs/er_diagram.png)

### テーブル定義例：users
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | INT | 主キー（AUTO_INCREMENT） |
| name | VARCHAR(50) | ユーザー名 |
| email | VARCHAR(100) | メールアドレス |
| password | VARCHAR(255) | ハッシュ化されたパスワード |
| created_at | DATETIME | 登録日時 |

### favorite_addresses
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | INT | 主キー（AUTO_INCREMENT） |
| user_id | INT | users.id と紐づく外部キー |
| address | VARCHAR(255) | 入力された住所文字列 |
| latitude | DOUBLE | 緯度（裏側で自動取得）|
| longitude | DOUBLE | 経度（裏側で自動取得）|
| created_at | TIMESTAMP | 登録日時 |

---

## 🧠 設計方針・工夫点
- MVC設計：Servlet（Controller）、DAO（Model）、JSP（View）を分離
- SQLインジェクション対策として **PreparedStatement** を使用
- パスワードは **ハッシュ化（SHA-256 / bcrypt）** して保存
- JSP include によるヘッダー・フッターの共通化
- ER図・シーケンス図を用いて処理を明確化

---

## 📊 UML / 設計資料
> 以下のファイルを差し替えてください（今はプレースホルダー画像です）：
>
> - `docs/usecase.png`：ユースケース図  
> - `docs/uml_sequence.png`：シーケンス図  
> - `docs/class_diagram.png`：クラス図  
>
> 例：  
> ![シーケンス図](./docs/uml_sequence.png)

---

## 💬 使用技術のポイント
- **Servlet & JSP**：HTTPリクエスト処理・セッション管理・リダイレクト制御  
- **DAOパターン**：DB操作の共通化・保守性向上  
- **SQL**：CRUD・JOIN・トランザクション  
- **HTML/CSS**：UI / フォーム入力補助  
- **Tomcat**：WARデプロイ・ローカルテスト環境構築  

---

## 🧭 今後の拡張予定
- Bootstrap / Vue.js の導入でUI改善  
- REST API 化（JSON対応）  
- Docker による環境構築自動化  
- ログイン履歴・アクセスログの分析機能追加  
- JUnit / Mockito による単体テストの充実  

---

## 📸 画面キャプチャ（例）
> - `docs/login_screen.png`  
> - `docs/list_screen.png`  
>
> 例：  
> ![ログイン画面](./docs/login_screen.png)

---

## 🧾 ライセンス・著作権
このプロジェクトは学習目的で作成したものであり、商用利用は想定していません。  
各種ライブラリ・ツールのライセンスはそれぞれの作者に帰属します。

---

## 👤 作成者
- **氏名（またはGitHubアカウント）**：sakane012  
- **開発期間**：2025年○月〜○月  
- **連絡先**：your-email@example.com  
- **GitHub**：https://github.com/yourname/java-webapp-portfolio

---

## ✅ 最終更新日
2025-11-13

---

> ✏️ **編集方法**：VS Code / Typora などの Markdown 対応エディタで開くと、見出しや画像をプレビューできます。