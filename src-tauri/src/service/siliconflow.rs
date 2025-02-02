use std::str::from_utf8;

use futures_util::StreamExt;
use serde::Serialize;
use serde_json::Value;

const BASE_URL: &str = "https://api.siliconflow.cn/v1";

#[derive(Serialize, Debug)]
pub struct Message {
    pub role: String,
    pub content: String,
}
#[derive(Serialize, Debug)]
pub struct AiBody {
    model: String,
    messages: Vec<Message>,
    stream: bool,
    stop: Vec<String>,
    max_tokens: u32,
    temperature: f32,
    top_p: f32,
    top_k: u32,
    frequency_penalty: f32,
    n: u32,
}
impl Default for AiBody {
    fn default() -> Self {
        Self {
            model: "deepseek-ai/DeepSeek-V3".to_string(),
            messages: vec![],
            stream: false,
            stop: vec!["null".to_string()],
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
        }
    }
}
pub struct AiClient {
    api_key: String,
    base_url: String,
}

impl AiClient {
    pub fn new(api_key: &str, base_url: Option<String>) -> Self {
        Self {
            api_key: api_key.to_string(),
            base_url: base_url.unwrap_or(BASE_URL.to_string()),
        }
    }
    fn create_reqwest_request(&self, body: AiBody) -> reqwest::RequestBuilder {
        let client = reqwest::Client::new();
        client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
    }
    // pub async fn create_chat(&self, body: AiBody) -> Result<Value, Box<dyn std::error::Error>> {
    //     let request = self.create_reqwest_request(body);
    //     let response = request.send().await?;

    //     let text = response.text().await?;
    //     let value: Value = serde_json::from_str(&text)?;
    //     Ok(value)
    // }
    pub async fn create_chat_stream<F>(
        &self,
        body: AiBody,
        callback: F,
    ) -> Result<(), Box<dyn std::error::Error>>
    where
        F: FnMut(String) + Send + 'static,
    {
        let request = self.create_reqwest_request(body);
        let mut stream = request.send().await?.bytes_stream();
        let mut callback = callback;
        while let Some(item) = stream.next().await {
            match item {
                Ok(bytes) => {
                    let text = from_utf8(&bytes)?;
                    // text: (data/error/...): {...}
                    // split with ":"
                    let text = text.split(":").collect::<Vec<&str>>();
                    if text.len() < 2 {
                        continue;
                    }
                    let status = text[0];
                    if status == "data" {
                        let content = text[1..].join(":").to_string();
                        if content.trim() == "[DONE]" {
                            break;
                        }
                        let value: Value = serde_json::from_str(&content)?;
                        // Object {"choices": Array [Object {"content_filter_results": Object {"hate": Object {"filtered": Bool(false)}, "self_harm": Object {"filtered": Bool(false)}, "sexual": Object {"filtered": Bool(false)}, "violence": Object {"filtered": Bool(false)}}, "delta": Object {"content": String("状态")}, "finish_reason": Null, "index": Number(0)}], "created": Number(1738520926), "id": String("0194c7ec193befc82519c20768376898"), "model": String("deepseek-ai/DeepSeek-V3"), "object": String("chat.completion.chunk"), "system_fingerprint": String(""), "usage": Object {"completion_tokens": Number(1), "prompt_tokens": Number(154), "total_tokens": Number(155)}}
                        let content = value
                            .get("choices")
                            .unwrap()
                            .get(0)
                            .unwrap()
                            .get("delta")
                            .unwrap()
                            .get("content")
                            .unwrap()
                            .as_str()
                            .unwrap();
                        callback(content.to_string());
                    }
                }
                Err(e) => {
                    return Err(e.into());
                }
            }
        }
        Ok(())
    }
}

#[allow(dead_code)]
pub async fn create_chat<F>(
    api_key: &str,
    messages: Vec<Message>,
    callback: F,
) -> Result<(), Box<dyn std::error::Error>>
where
    F: FnMut(String) + Send + 'static,
{
    let client = AiClient::new(api_key, None);
    let body = AiBody {
        model: "deepseek-ai/DeepSeek-V3".to_string(),
        messages,
        stream: true,
        ..Default::default()
    };
    let _ = client.create_chat_stream(body, callback).await;
    Ok(())
}
