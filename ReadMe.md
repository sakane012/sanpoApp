# 🌐 さんぽルートメーカー（Java / JSP / Servlet / javaScript）

## 概要
本アプリは、ユーザが入力した現在地や条件に応じて、散歩ルートを提案する
webアプリケーションです。  
ランダムにルートを提示することで、日常の散歩をより充実させます。  


---

## 開発環境
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

## 機能一覧
| カテゴリ | 内容 |
|------------|------|
| ログイン機能 | 新規登録・ログイン・ログアウト|
| 現在地取得機能 | GoogleAPIで現在地を取得、フォームに自動入力 |
| お気に入り機能 | 追加、削除 |
| ルート生成機能 |ユーザーの現在地、時間 or 距離を条件にランダムなルート生成 |

---

## ディレクトリ構成
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
│   │   │       ├── DeleteFavoriteServlet.java
│   │   │       ├── FavoreteListServlet.java
│   │   │       ├── LoginServlet.java
│   │   │       ├── LogoutServlet.java
│   │   │       ├── RegisterAddressServlet.java
│   │   │       ├── ResultServlet.java
│   │   │       ├── SignupServlet.java
│   │   │       └── WelcomeServlet.java
│   │   └── webapp/
│   │       ├── jsp
│   │       │   ├── index.jsp
│   │       │   ├── login.jsp
│   │       │   ├── logout.jsp
│   │       │   └── search.jsp
│   │       └── WEB-INF/
│   │           ├── favorites.jsp
│   │           ├── header.jsp
│   │           ├── footer.jsp
│   │           ├── welcome.jsp
│   │           └── result.jsp
│   └── test/
└── README.md

---

##  データベース構成

### テーブル定義例：users
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | INT | 主キー（AUTO_INCREMENT） |
| name | VARCHAR | ユーザー名 |
| email | VARCHAR | メールアドレス |
| password | VARCHAR(255) | ハッシュ化されたパスワード |
| created_at | DATETIME | 登録日時 |

### favorite_addresses
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | INT | 主キー（AUTO_INCREMENT） |
| user_id | INT | users.id (外部キー) |
| prefecture| VARCHAR | 都道府県 |
| cityStreet | VARCHAR | 市区町村・町名|
| buildingNumber | VARCHAR | 番地 |
| latitude | DOUBLE | 緯度 |
| longitude | DOUBLE | 経度 |
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

##  使用技術のポイント
- **Servlet & JSP**：HTTPリクエスト処理・セッション管理・リダイレクト制御  
- **DAOパターン**：DB操作の共通化・保守性向上  
- **SQL**：CRUD・JOIN・トランザクション  
- **Tomcat**：ローカルテスト環境構築  

---

##  今後の拡張予定


---

##  画面キャプチャ（例）


---

## 🧾 ライセンス・著作権
このプロジェクトは学習目的で作成したものであり、商用利用は想定していません。  
各種ライブラリ・ツールのライセンスはそれぞれの作者に帰属します。

---

## 👤 作成者
- **GitHubアカウント**：sakane012  
- **開発期間**：2025年10月〜11月  
- **連絡先**：sakanereiji@gmail.com  
- **GitHub**：https://github.com/yourname/java-webapp-portfolio

---

## ✅ 最終更新日
2025-11-17

---

> ✏️ **編集方法**：VS Code / Typora などの Markdown 対応エディタで開くと、見出しや画像をプレビューできます。