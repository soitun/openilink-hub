package database

import (
	"os"
	"testing"
)

// testDB returns a connected *DB for integration tests.
// Skips the test if DATABASE_URL is not set.
func testDB(t *testing.T) *DB {
	t.Helper()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}
	db, err := Open(dsn)
	if err != nil {
		t.Fatalf("open database: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func cleanupUser(t *testing.T, db *DB, id string) {
	t.Helper()
	t.Cleanup(func() {
		db.Exec("DELETE FROM users WHERE id = $1", id)
	})
}

func TestUserCRUD(t *testing.T) {
	db := testDB(t)

	user, err := db.CreateUser("test_user_crud", "Test User")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	cleanupUser(t, db, user.ID)

	if user.Username != "test_user_crud" {
		t.Errorf("username = %q", user.Username)
	}

	got, err := db.GetUserByID(user.ID)
	if err != nil {
		t.Fatalf("get by id: %v", err)
	}
	if got.Username != user.Username {
		t.Errorf("got username = %q, want %q", got.Username, user.Username)
	}

	got2, err := db.GetUserByUsername("test_user_crud")
	if err != nil {
		t.Fatalf("get by username: %v", err)
	}
	if got2.ID != user.ID {
		t.Errorf("got id = %q, want %q", got2.ID, user.ID)
	}
}

func TestBotCRUD(t *testing.T) {
	db := testDB(t)

	user, _ := db.CreateUser("test_bot_user", "Bot User")
	cleanupUser(t, db, user.ID)

	bot, err := db.CreateBot(user.ID, "ilink-bot-123", "token-abc", "https://example.com", "user@im.wechat")
	if err != nil {
		t.Fatalf("create bot: %v", err)
	}

	if bot.Status != "connected" {
		t.Errorf("status = %q, want connected", bot.Status)
	}

	bots, err := db.ListBotsByUser(user.ID)
	if err != nil {
		t.Fatalf("list bots: %v", err)
	}
	if len(bots) != 1 {
		t.Fatalf("got %d bots, want 1", len(bots))
	}

	if err := db.UpdateBotStatus(bot.ID, "disconnected"); err != nil {
		t.Fatalf("update status: %v", err)
	}
	updated, _ := db.GetBot(bot.ID)
	if updated.Status != "disconnected" {
		t.Errorf("status after update = %q", updated.Status)
	}

	if err := db.UpdateBotSyncBuf(bot.ID, "buf-data"); err != nil {
		t.Fatalf("update sync buf: %v", err)
	}
	updated, _ = db.GetBot(bot.ID)
	if updated.SyncBuf != "buf-data" {
		t.Errorf("sync_buf = %q", updated.SyncBuf)
	}

	if err := db.DeleteBot(bot.ID); err != nil {
		t.Fatalf("delete bot: %v", err)
	}
	_, err = db.GetBot(bot.ID)
	if err == nil {
		t.Error("expected error after delete")
	}
}

func TestSublevelCRUD(t *testing.T) {
	db := testDB(t)

	user, _ := db.CreateUser("test_sub_user", "Sub User")
	cleanupUser(t, db, user.ID)
	bot, _ := db.CreateBot(user.ID, "bot-sub", "tok", "", "")

	sub, err := db.CreateSublevel(user.ID, bot.ID, "My Sub")
	if err != nil {
		t.Fatalf("create sublevel: %v", err)
	}
	if sub.APIKey == "" {
		t.Error("api_key should not be empty")
	}
	if !sub.Enabled {
		t.Error("should be enabled by default")
	}

	subs, err := db.ListSublevelsByUser(user.ID)
	if err != nil || len(subs) != 1 {
		t.Fatalf("list = %d, err = %v", len(subs), err)
	}

	got, err := db.GetSublevelByAPIKey(sub.APIKey)
	if err != nil {
		t.Fatalf("get by api key: %v", err)
	}
	if got.Name != "My Sub" {
		t.Errorf("name = %q", got.Name)
	}

	newKey, err := db.RotateSublevelKey(sub.ID)
	if err != nil {
		t.Fatalf("rotate key: %v", err)
	}
	if newKey == sub.APIKey {
		t.Error("rotated key should differ")
	}

	// Old key should not work
	_, err = db.GetSublevelByAPIKey(sub.APIKey)
	if err == nil {
		t.Error("old key should not resolve")
	}

	if err := db.DeleteSublevel(sub.ID); err != nil {
		t.Fatalf("delete: %v", err)
	}
}

func TestMessageCRUD(t *testing.T) {
	db := testDB(t)

	user, _ := db.CreateUser("test_msg_user", "Msg User")
	cleanupUser(t, db, user.ID)
	bot, _ := db.CreateBot(user.ID, "bot-msg", "tok", "", "")

	for i := 0; i < 5; i++ {
		err := db.SaveMessage(bot.ID, "inbound", "user@im.wechat", 1, "hello", nil)
		if err != nil {
			t.Fatalf("save message %d: %v", i, err)
		}
	}

	subID := "sub-123"
	err := db.SaveMessage(bot.ID, "outbound", "user@im.wechat", 1, "reply", &subID)
	if err != nil {
		t.Fatalf("save outbound: %v", err)
	}

	msgs, err := db.ListMessages(bot.ID, 10, 0)
	if err != nil {
		t.Fatalf("list messages: %v", err)
	}
	if len(msgs) != 6 {
		t.Fatalf("got %d messages, want 6", len(msgs))
	}

	// Should be ordered DESC
	if msgs[0].ID < msgs[len(msgs)-1].ID {
		t.Error("messages should be ordered by id DESC")
	}

	// Pagination
	msgs2, err := db.ListMessages(bot.ID, 3, msgs[2].ID)
	if err != nil {
		t.Fatalf("list with before: %v", err)
	}
	if len(msgs2) != 3 {
		t.Fatalf("paginated got %d, want 3", len(msgs2))
	}
	if msgs2[0].ID >= msgs[2].ID {
		t.Error("paginated results should have id < before")
	}
}

func TestCredentialCRUD(t *testing.T) {
	db := testDB(t)

	user, _ := db.CreateUser("test_cred_user", "Cred User")
	cleanupUser(t, db, user.ID)

	cred := &Credential{
		ID:              "cred-id-1",
		UserID:          user.ID,
		PublicKey:       []byte("fake-public-key"),
		AttestationType: "none",
		Transport:       `["internal"]`,
		SignCount:       0,
	}
	if err := db.SaveCredential(cred); err != nil {
		t.Fatalf("save credential: %v", err)
	}

	creds, err := db.GetCredentialsByUserID(user.ID)
	if err != nil {
		t.Fatalf("get credentials: %v", err)
	}
	if len(creds) != 1 {
		t.Fatalf("got %d credentials, want 1", len(creds))
	}
	if string(creds[0].PublicKey) != "fake-public-key" {
		t.Errorf("public_key = %q", string(creds[0].PublicKey))
	}

	if err := db.UpdateCredentialSignCount("cred-id-1", 5); err != nil {
		t.Fatalf("update sign count: %v", err)
	}
	creds, _ = db.GetCredentialsByUserID(user.ID)
	if creds[0].SignCount != 5 {
		t.Errorf("sign_count = %d, want 5", creds[0].SignCount)
	}
}
