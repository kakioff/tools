use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_padding::Pkcs7;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::str;
use tauri::http::HeaderMap;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

fn generate_random_bytes(len: usize) -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let iv: Vec<u8> = (0..len).map(|_| rng.gen()).collect();
    iv
}

fn get_param_str(ids: &str, data: &str) -> Result<String, Box<dyn std::error::Error>> {
    let iv = generate_random_bytes(16); // 生成16字节的随机数据

    let key = get_aes_key(ids);
    let encrypted = aes_encrypt(data, &key, &iv)?;
    let iv_str = hex::encode(iv);
    Ok(format!("{}{}", iv_str, encrypted))
}
fn get_aes_key(user_id: &str) -> String {
    let mut ret = String::new();
    let user_id_len = user_id.len();
    let full_repeats = 32 / user_id_len; // Use 16 instead of 32 for AES-128
    let remainder = 32 % user_id_len; // Use 16 instead of 32 for AES-128

    for _ in 0..full_repeats {
        ret.push_str(user_id);
    }
    ret.push_str(&user_id[0..remainder]);

    ret
}

fn aes_encrypt(
    plaintext: &str,
    key: &str,
    iv: &[u8],
) -> Result<String, Box<dyn std::error::Error>> {
    let cipher = Aes256Cbc::new_from_slices(key.as_bytes(), iv)?;
    let ciphertext = cipher.encrypt_vec(plaintext.as_bytes());
    // return base64
    Ok(base64::encode(ciphertext))
}
/// AES 解密函数
fn aes_decrypt(json_str: &str, key: &str, iv: &[u8]) -> String {
    let mut result = key.to_string();

    if result.len() < 32 {
        while result.len() < 32 {
            result.push('0'); // 填充密钥
        }
    } else if result.len() > 32 {
        result.truncate(32); // 截断密钥
    }

    let key = result; // 确保密钥长度为32字节
    let cipher = Aes256Cbc::new_from_slices(key.as_bytes(), iv).unwrap();
    let decrypted = cipher
        .decrypt_vec(&base64::decode(json_str).unwrap())
        .unwrap();
    String::from_utf8(decrypted).unwrap()
}
/// 获取数据的核心函数
fn get_data(ids: &str, data: &str) -> serde_json::Value {
    let data_str = get_data_str(ids, data);
    serde_json::from_str(&data_str).unwrap()
}

/// 解析加密数据的函数
fn get_data_str(ids: &str, data: &str) -> String {
    let iv = &data[0..32]; // 获取前32个字符作为IV
    let encrypted_data = &data[32..]; // 获取剩余部分作为密文

    let key = get_aes_key(ids); // 获取AES密钥
    aes_decrypt(encrypted_data, &key, &hex::decode(iv).unwrap())
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CheckResult {
    pub words: String,
    pub words_type: u8,
    pub words_type_name: String,
}

#[allow(dead_code)]
pub async fn chaci(
    content: &str,
    ids: &str,
    cookie: &str,
) -> Result<Vec<CheckResult>, Box<dyn std::error::Error>> {
    // JSON
    let data = serde_json::json!({
        "words_type": ["0","1","2","3","4","5"],
        "check_text": content,
    });
    let data_str = get_param_str(ids, data.to_string().as_str()).unwrap();
    let reqw = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("Cookie", cookie.parse().unwrap());
    headers.insert("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0".parse().unwrap());
    headers.insert("Content-Type", "application/json".parse().unwrap());

    let res = reqw
        .post("https://www.lingkechaci.com/index/index/check_text.html")
        .headers(headers)
        .body(format!("{{\"access\":\"{}\"}}", data_str))
        .send()
        .await?;
    let res_data: serde_json::Value = res.json().await.unwrap();
    let res_token = &res_data["token"];

    let res_data = get_data(ids, res_token.as_str().unwrap());
    //  {
    //     "error": 0,
    //     "msg": "请求成功!",
    //     "data": {
    //         "baidu_check": {
    //             "is_pass": 1,
    //             "words": [],
    //             "target": []
    //         },
    //         "local_check": {
    //             "is_pass": 0,
    //             "words": [
    //                 {
    //                     "words": "最",
    //                     "words_type": 2,
    //                     "words_type_name": "小红书词"
    //                 },
    //                 {
    //                     "words": "最好",
    //                     "words_type": 1,
    //                     "words_type_name": "敏感词"
    //                 }
    //             ],
    //             "target": [
    //                 "小红书词",
    //                 "敏感词"
    //             ]
    //         },
    //         "baidu_status": {
    //             "error_code": 18,
    //             "error_msg": "Open api qps request limit reached"
    //         }
    //     }
    // }

    let data = res_data["data"]["local_check"]["words"].as_array().unwrap();
    let mut checked = Vec::new();
    for v in data {
        checked.push(CheckResult {
            words: v["words"].as_str().unwrap().to_string(),
            words_type: v["words_type"].as_i64().unwrap() as u8,
            words_type_name: v["words_type_name"].as_str().unwrap().to_string(),
        });
    }
    // 按照词汇长度从长到短排序
    checked.sort_by(|a, b| b.words.len().cmp(&a.words.len()));

    // 用于存储最终结果
    let mut result = Vec::new();

    for item in checked.clone() {
        // 检查当前词是否是已保留词的子串
        let is_substring = result
            .iter()
            .any(|existing: &CheckResult| existing.words.contains(&item.words));
        if !is_substring {
            result.push(item);
        }
    }
    // body
    Ok(result)
}
