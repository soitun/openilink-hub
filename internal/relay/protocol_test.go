package relay

import (
	"encoding/json"
	"testing"
)

func TestNewEnvelope(t *testing.T) {
	env := NewEnvelope("message", MessageData{
		MessageID:  123,
		FromUserID: "user@im.wechat",
		Timestamp:  1711100000000,
		Items:      []MessageItem{{Type: "text", Text: "hello"}},
	})

	if env.Type != "message" {
		t.Fatalf("type = %q, want %q", env.Type, "message")
	}

	var data MessageData
	if err := json.Unmarshal(env.Data, &data); err != nil {
		t.Fatalf("unmarshal data: %v", err)
	}
	if data.MessageID != 123 {
		t.Errorf("message_id = %d, want 123", data.MessageID)
	}
	if data.FromUserID != "user@im.wechat" {
		t.Errorf("from_user_id = %q, want %q", data.FromUserID, "user@im.wechat")
	}
	if len(data.Items) != 1 || data.Items[0].Text != "hello" {
		t.Errorf("items = %+v, want [{text hello}]", data.Items)
	}
}

func TestNewAck(t *testing.T) {
	tests := []struct {
		name     string
		reqID    string
		success  bool
		clientID string
		errMsg   string
	}{
		{"success", "req-1", true, "sdk-123", ""},
		{"failure", "req-2", false, "", "bot not connected"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			env := NewAck(tt.reqID, tt.success, tt.clientID, tt.errMsg)
			if env.Type != "send_ack" {
				t.Fatalf("type = %q, want send_ack", env.Type)
			}

			var ack SendAckData
			if err := json.Unmarshal(env.Data, &ack); err != nil {
				t.Fatalf("unmarshal: %v", err)
			}
			if ack.ReqID != tt.reqID {
				t.Errorf("req_id = %q, want %q", ack.ReqID, tt.reqID)
			}
			if ack.Success != tt.success {
				t.Errorf("success = %v, want %v", ack.Success, tt.success)
			}
			if ack.ClientID != tt.clientID {
				t.Errorf("client_id = %q, want %q", ack.ClientID, tt.clientID)
			}
			if ack.Error != tt.errMsg {
				t.Errorf("error = %q, want %q", ack.Error, tt.errMsg)
			}
		})
	}
}

func TestEnvelopeJSON(t *testing.T) {
	env := Envelope{Type: "ping"}
	data, err := json.Marshal(env)
	if err != nil {
		t.Fatal(err)
	}

	var decoded Envelope
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatal(err)
	}
	if decoded.Type != "ping" {
		t.Errorf("type = %q, want ping", decoded.Type)
	}
	if decoded.Data != nil {
		t.Errorf("data = %s, want nil", string(decoded.Data))
	}
}

func TestSendTextDataJSON(t *testing.T) {
	input := `{"type":"send_text","req_id":"abc","data":{"to_user_id":"user123","text":"hi"}}`
	var env Envelope
	if err := json.Unmarshal([]byte(input), &env); err != nil {
		t.Fatal(err)
	}
	if env.Type != "send_text" {
		t.Errorf("type = %q", env.Type)
	}
	if env.ReqID != "abc" {
		t.Errorf("req_id = %q", env.ReqID)
	}

	var data SendTextData
	if err := json.Unmarshal(env.Data, &data); err != nil {
		t.Fatal(err)
	}
	if data.ToUserID != "user123" || data.Text != "hi" {
		t.Errorf("data = %+v", data)
	}
}
